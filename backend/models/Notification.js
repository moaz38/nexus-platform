const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    userId: { // Jisko notification mile ga
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['message', 'alert', 'system'],
        default: 'system'
    },
    content: {
        type: String,
        required: true
    },
    senderId: { // Jisne action kiya (optional)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);