import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from './src/models/event.model.js';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mangoDolly');
        console.log('Connected to DB');

        // Clean up existing dummy events to avoid confusion
        await Event.deleteMany({ title: /MVP/ });

        const pastEvent = new Event({
            title: 'Past Event MVP ' + Date.now(),
            description: 'This is a past event to test the filter.',
            category: 'Technical',
            eventType: 'Workshop',
            participationType: 'Solo',
            isDraft: false,
            isVerified: true,
            registrationStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            registrationEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6)
        });

        const liveEvent = new Event({
            title: 'Live Event MVP ' + Date.now(),
            description: 'This is a live event to test the filter.',
            category: 'Cultural',
            eventType: 'Festival',
            participationType: 'Team',
            minTeamSize: 2,
            isDraft: false,
            isVerified: true,
            registrationStart: new Date(Date.now() + 1000 * 60 * 60 * 24),
            registrationEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5)
        });

        const upcomingEvent = new Event({
            title: 'Upcoming Event MVP ' + Date.now(),
            description: 'This is an upcoming event to test the filter.',
            category: 'Sports',
            eventType: 'Competition',
            participationType: 'Solo',
            isDraft: false,
            isVerified: true,
            registrationStart: null
        });

        await pastEvent.save();
        await liveEvent.save();
        await upcomingEvent.save();

        console.log('Dummy events created!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
