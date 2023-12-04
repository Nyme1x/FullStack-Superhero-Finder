const express = require('express');
const router = express.Router();
const Superhero = require('../models/superhero');

// Get all superheroes
router.get("/", (req, res) => {
    Superhero.find({})
        .then(superheroes => res.json(superheroes))
        .catch(err => res.status(500).json({ error: "Internal Server Error" }));
});

// Get distinct publishers
router.get("/publishers", (req, res) => {
    Superhero.distinct("publisher")
        .then(publishers => {
            if (!publishers.length) {
                return res.status(404).json({ error: "No publishers found" });
            }
            res.json(publishers);
        })
        .catch(err => res.status(500).json({ error: "Internal Server Error" }));
});

// Get superhero by ID
router.get("/:id", (req, res) => {
    Superhero.findOne({ id: req.params.id })
        .then(superhero => {
            if (superhero) {
                res.json(superhero);
            } else {
                res.status(404).json({ error: "Superhero not found" });
            }
        })
        .catch(err => res.status(500).json({ error: "Internal Server Error" }));
});

// Get powers of a superhero by ID
router.get("/:id/powers", (req, res) => {
    Superhero.findOne({ id: req.params.id })
        .then(superhero => {
            if (superhero) {
                res.json(superhero.powers);
            } else {
                res.status(404).json({ error: "Superhero not found" });
            }
        })
        .catch(err => res.status(500).json({ error: "Internal Server Error" }));
});

// Search superheroes
router.get('/api/search', async (req, res) => {
    const { field, pattern, race, power, publisher, n } = req.query;
    let query = {};
  
    if (field && pattern) {
      query[field] = { $regex: new RegExp(pattern, 'i') }; // Original search functionality
    }
    if (race) query.race = { $regex: new RegExp(race, 'i') };
    if (power) query.powers = { $regex: new RegExp(power, 'i') };
    if (publisher) query.publisher = { $regex: new RegExp(publisher, 'i') };
  
    try {
      let matchingSuperheroes = await Superhero.find(query);
      if (n && !isNaN(n)) {
        matchingSuperheroes = matchingSuperheroes.slice(0, n);
      }
      res.json(matchingSuperheroes);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

module.exports = router;
