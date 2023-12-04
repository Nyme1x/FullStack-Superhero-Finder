    const express = require('express');
    const router = express.Router();
    const SuperheroList = require('../models/list'); // Adjust the path to your model
    const Superhero = require('../models/superhero'); // The new superhero model
    const User = require('../models/user'); // The new superhero model


    // Create a new superhero list
    // Create a new superhero list
   // Create a new superhero list
router.post("/lists/create", async (req, res) => {
    const { username, name, description, visibility } = req.body;

    if (!username || !name) {
        return res.status(400).send("Username and list name are required.");
    }

    try {
        const newList = new SuperheroList({
            username,
            name,
            description,
            superheroIds: [],
            visibility,
            user: req.user,
        });

        await newList.save();
        res.status(201).send("List created successfully.");
    } catch (error) {
        console.error("Error creating new list:", error); // Log the detailed error
        if (error.code === 11000) {
            res.status(409).send("A list with this username or name already exists.");
        } else {
            res.status(500).send("Internal Server Error");
        }
    }
});

    router.get("/lists", async (req, res) => {
        const username = req.query.username; // Retrieve username from query parameters

        try {
            let query = {};
            if (username) {
                query.username = username; // Filter by username if it's provided
            }

            const lists = await SuperheroList.find(query);
            res.json(lists);
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    });

    // Get all superhero lists
    router.get("/", async (req, res) => {
        try {
            const lists = await SuperheroList.find({});
            res.json(lists);
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    });

    // Add superheroes to a list
    router.put("/add/:listName", async (req, res) => {
        const listName = req.params.listName;
        const { superheroIds } = req.body;

        try {
            const list = await SuperheroList.findOne({ name: listName });
            if (!list) {
                return res.status(404).send("List not found.");
            }

            list.superheroIds.push(...superheroIds);
            await list.save();
            res.send("Superhero(s) added to the list.");
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    });

// Remove a superhero from a list
// In your backend routes (assuming this is part of the same router as the other endpoints)

router.delete("/remove/:listName/:superheroId", async (req, res) => {
    const { listName, superheroId } = req.params;

    try {
        const list = await SuperheroList.findOne({ name: listName });
        if (!list) {
            return res.status(404).send("List not found.");
        }

        // Remove the superhero from the list
        list.superheroIds = list.superheroIds.filter(id => id !== superheroId);
        await list.save();

        res.status(200).send("Superhero removed from the list.");
    } catch (error) {
        console.error('Error removing superhero from list:', error);
        res.status(500).send("Internal Server Error");
    }
});


    // Retrieve a list of superheroes by list name
    router.get("/:name", async (req, res) => {
        const listName = req.params.name;

        try {
            const list = await SuperheroList.findOne({ name: listName });
            if (!list) {
                return res.status(404).send("List not found.");
            }
            res.json(list.superheroIds);
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    });

    // Route to get superhero info by list name
    router.get("/:listName/superheroes/info", async (req, res) => {
        const listName = req.params.listName;

        try {
            const list = await SuperheroList.findOne({ name: listName });
            if (!list) {
                return res.status(404).send("List not found.");
            }

            // Now that you have the list, use the superheroIds to find superheroes
            const superheroes = await Superhero.find({ id: { $in: list.superheroIds } });

            if (!superheroes.length) {
                return res.status(404).send("No superheroes found for this list.");
            }

            res.json(superheroes);
        } catch (error) {
            console.error("Error in getting superheroes info:", error); // Detailed error log for debugging
            res.status(500).send("Internal Server Error");
        }
    });

    // Update superhero IDs in a list
    router.put("/:name", async (req, res) => {
        const listName = req.params.name;
        const newSuperheroIds = req.body.superheroIds;

        if (!Array.isArray(newSuperheroIds)) {
            return res.status(400).send("Invalid input: expected an array of superhero IDs.");
        }

        try {
            const list = await SuperheroList.findOneAndUpdate(
                { name: listName },
                { superheroIds: newSuperheroIds },
                { new: true }
            );

            if (!list) {
                return res.status(404).send("List not found.");
            }

            res.send(`Superhero IDs updated for list: ${listName}.`);
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    });

    // Delete a superhero list
    router.delete("/:name", async (req, res) => {
        const listName = req.params.name;

        try {
            const result = await SuperheroList.findOneAndDelete({ name: listName });
            if (!result) {
                return res.status(404).send("List not found.");
            }
            res.send(`List ${listName} has been deleted.`);
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    });

    // Get all public superhero lists
    router.get("/Find/public", async (req, res) => {
        try {
            const publicLists = await SuperheroList.find({ visibility: 'public' })
            .sort({ lastModified: -1 }) // Sort by last modified date
            .limit(10) // Limit to 10 results
            .exec();
            res.json(publicLists);
        } catch (error) {
            console.error("Error fetching public lists:", error);
            res.status(500).send("Internal Server Error");
        }
    });
  
     // POST route to add a review to a public list
router.post('/lists/:listName/reviews', async (req, res) => {
    const { listName } = req.params;
    const { reviewerName, comment, rating } = req.body;

    try {
        // Find the list by its name
        const list = await SuperheroList.findOne({ name: listName });
        if (!list) {
            return res.status(404).send(`List '${listName}' not found.`);
        }

        // Check if the list is public before adding a review
        if (list.visibility !== 'public') {
            return res.status(403).send('Only public lists can be reviewed.');
        }

        // Create a new review and push it to the reviews array of the list
        const newReview = {
            reviewerName,
            comment,
            rating,
            hidden: false, // Assuming you want all new reviews to be visible by default
            createdAt: new Date() // This line is optional as the default is already Date.now in your schema
        };

        list.reviews.push(newReview); // Push the new review to the list

        // Save the list with the new review
        await list.save();

        res.status(200).json({ message: 'Review added successfully.', review: newReview });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).send('Server error');
    }
});

    
  
    router.get('/lists/:listName/reviews', async (req, res) => {
        const { listName } = req.params;
      
        try {
          // Again, corrected the field name to 'name'
          const list = await SuperheroList.findOne({ name: listName }).select('reviews');
          if (!list) {
            return res.status(404).send(`List '${listName}' not found.`);
          }
      
          // Send back the list of reviews
          res.status(200).json(list.reviews);
        } catch (error) {
          console.error('Server Error:', error);
          res.status(500).send('Server error');
        }
    });

    const adminCheck = async (req, res, next) => {
        // Retrieve the admin's username from the request query
        const adminUsername = req.query.adminUsername;
      
        try {
          const adminUser = await User.findOne({ name: adminUsername });
          if (adminUser && adminUser.isAdmin) {
            next(); // The user is an admin, proceed to the next handler
          } else {
            return res.status(403).json({
              status: "FAILED",
              message: "Access denied. Admins only."
            });
          }
        } catch (err) {
          return res.status(500).json({
            status: "FAILED",
            message: "Internal server error"
          });
        }
      };



    // Hide a review
// Hide a review within a list
router.put('/lists/:listName/reviews/hide/:reviewId', adminCheck, async (req, res) => {
    const { listName, reviewId } = req.params;

    try {
        const list = await SuperheroList.findOneAndUpdate(
            { name: listName, 'reviews._id': reviewId },
            { $set: { 'reviews.$.hidden': true } }, // Use the positional $ operator to update hidden field of the specific review
            { new: true }
        );

        if (!list) {
            return res.status(404).json({ status: 'FAILED', message: 'List or review not found' });
        }

        res.json({ status: 'SUCCESS', message: 'Review hidden successfully', data: list });
    } catch (err) {
        res.status(500).json({ status: 'FAILED', message: 'Could not hide review', error: err.toString() });
    }
});

// Unhide a review within a list
router.put('/lists/:listName/reviews/unhide/:reviewId', adminCheck, async (req, res) => {
    const { listName, reviewId } = req.params;

    try {
        const list = await SuperheroList.findOneAndUpdate(
            { name: listName, 'reviews._id': reviewId },
            { $set: { 'reviews.$.hidden': false } }, // Use the positional $ operator to update hidden field of the specific review
            { new: true }
        );

        if (!list) {
            return res.status(404).json({ status: 'FAILED', message: 'List or review not found' });
        }

        res.json({ status: 'SUCCESS', message: 'Review unhidden successfully', data: list });
    } catch (err) {
        res.status(500).json({ status: 'FAILED', message: 'Could not unhide review', error: err.toString() });
    }
});

    module.exports = router;