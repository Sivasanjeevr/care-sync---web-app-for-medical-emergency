const mongoose =require("mongoose");

const usersSchema = new mongoose.Schema({
    email: String,
    password: String,
    username: String,
    age: String,
    patient_id: String,
    admin: String,
    admin_password: String,
    dob: String,
    blood_grp: String,
    gender: String,
    patient_number: String,
    nominee_number: String,
    nominee_name: String,
    nominee_relation: String,
    address: String,
    profile: String,
    phone_number: String,
    sugar: String,
    heart_rate: String,
    glucose: String,
    specialist: String,
    uploadedPDFs: [
        {
            fileName: String,
            filePath: String
        }
    ],
    lastview: String
});

const User = new mongoose.model('User',usersSchema);

module.exports = User;