import mongoose from 'mongoose';

const connectDB = async (URI) => {
    console.log('>> Connecting to database..');
    try {
        await mongoose.connect(URI);
        console.log('>> Database connected');
    } catch (err) {
        console.log('>> Cannot connect to database');
        throw err;
    }
}

export default connectDB;
