const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());


mongoose.connect('mongodb+srv://rohitdhaka2110:mon123@cluster0.hzlhn.mongodb.net/')
    .then(() => console.log("mongoose connected successfully"))
    .catch((err) => console.log("mongoose cannot connect ", err));
// ---------admin
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const Admin = mongoose.model("Admin", adminSchema);
// ---------user
const userSchema = new mongoose.Schema({    
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

// ----------user signup
app.post('/user/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).send("User already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);                
        const newUserId = new mongoose.Types.ObjectId();        
        const newUser = new User({ id: newUserId, name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).send({ msg: "User created successfully", userId: newUserId });
    } catch (err) {
        res.status(500).send("Error creating user: " + err.message);
    }
});

// ----------user login
app.post('/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send("Invalid email or password");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid email or password");
        }
        const token = jwt.sign({ id: user._id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).send({ msg: "Login successful", token });
    } catch (err) {
        res.status(500).send("Error logging in: " + err.message);
    }
});

// -----------update user name
// ----------update user name
app.put('/user/update-name', async (req, res) => {
    try {
        const { email, newName } = req.body;
        // Find the user by their custom ID and update their name
        const updatedUser = await User.findOneAndUpdate({ email: email }, { name: newName }, { new: true });

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        res.status(200).send({ msg: "Username updated successfully", updatedUser });
    } catch (err) {
        res.status(500).send("Error updating username: " + err.message);
    }
});




// ------------courses
const courseSchema = new mongoose.Schema({
    courseId: { type: String, required: true, unique: true }, 
    img: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true }
});
const Course = mongoose.model("Course", courseSchema);

// -----------addmin-signup
app.post('/admin/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).send("Admin already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ name, email, password: hashedPassword });
        await newAdmin.save();
        res.status(201).send({ msg: "Admin created successfully" });
    } catch (err) {
        res.status(500).send("Error creating admin: " + err.message);
    }
});
// -----------addmin-login
app.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).send("Invalid email or password");
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send("Invalid email or password");
        }
        const token = jwt.sign({ id: admin._id, email: admin.email }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).send({ msg: "Login successful", token });
    } catch (err) {
        res.status(500).send("Error logging in: " + err.message);
    }
});
// -----------add a course
app.post('/admin/add-course', async (req, res) => {
    try {
        const { courseId, img, title, description, price } = req.body;
        const newCourse = new Course({ courseId, img, title, description, price });
        await newCourse.save();

        res.status(201).send({ msg: "Course added successfully" });
    } catch (err) {
        res.status(500).send("Error adding course: " + err.message);
    }
});
// -----------get all courses
app.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).send(courses);
    } catch (err) {
        res.status(500).send("Error fetching courses: " + err.message);
    }
});
// -----------delete a course
app.delete('/admin/delete-course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await Course.findOneAndDelete({ courseId });
        if (!result) {
            return res.status(404).send("Course not found");
        }
        res.status(200).send({ msg: "Course deleted successfully" });
    } catch (err) {
        res.status(500).send("Error deleting course: " + err.message);
    }
});




app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});