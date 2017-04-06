const mongoose = require('mongoose');
const shortid  = require('shortid');

const contestSchema = new mongoose.Schema({

    _id:            { type: String, required: true, unique: true, default: shortid.generate },
    name:           { type: String, required: true },
    startDate:      { type: String, required: true },
    endDate:        { type: String, required: true },
    maxSalary:      { type: Number, required: true },
    players: [{
        id:         { type: Number, required: true },
        points:     { type: Number, required: true, default: 0 }
    }],

    entries: {
        numMax:     { type: Number, required: true },
        numCurrent: { type: Number, required: true, default: 0 },
        user_ids:   [String]
    }

});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;