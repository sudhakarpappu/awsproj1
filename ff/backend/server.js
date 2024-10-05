const express = require('express');
const app = express();
const fs = require('fs').promises; // Use promises for file operations
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());

// Middleware to parse JSON data
app.use(express.json());

// Define a simple route
app.get('/', (req, res) => {
  res.send('Backend server is running');
});

// Listen to the defined port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post("/register", async (req, resp) => {
    const { username: name, email, password: pwd } = req.body;

    const data = {
        name,
        email,
        password: pwd
    };

    // Utility functions to check for existing users by name or email
    const emailCheck = (json) => json.some(user => user.email === email);
    const nameCheck = (json) => json.some(user => user.name === name);

    try {
        // Read the users from the file
        const data1 = await fs.readFile("Users.json", 'utf-8');
        let json = JSON.parse(data1);

        // Check if the username or email already exists
        if (nameCheck(json)) {
            req.body.name = "";
            req.body.email = "";
            req.body.password = "";
            return resp.status(401).send({ error: 'Username already exists', ...req.body });
        }

        if (emailCheck(json)) {
            req.body.name = "";
            req.body.email = "";
            req.body.password = "";
            return resp.status(402).send({ error: 'Email already exists', ...req.body });
        }

        // Add new user to the list
        json.push(data);

        // Write updated user list to the file
        await fs.writeFile("Users.json", JSON.stringify(json, null, 2));

        // Send successful response after file write
        return resp.status(200).send({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        return resp.status(500).send({ error: 'Internal Server Error' });
    }
});


app.post("/login", async (req, resp) => {
    const { name, password } = req.body;

    try {
       
        const data1 = await fs.readFile("Users.json", 'utf-8');
        const json = JSON.parse(data1);


        const nameCheck = (json) => {
            for (let user of json) {
                
                if (user.name === name) {
                    
                    return user; 
                }
            }
            return null; 
        };

        const user = nameCheck(json);

        if (!user) {
            return resp.status(402).send("User name not found");
        } else {
            if (password !== user.password) {
                return resp.status(401).send("Wrong password");
            } else {
                console.log("Logged in");
                return resp.status(200).send({ message: "Login successful" }); // Send success response
            }
        }
    } catch (error) {
        console.error('Error during login:', error);
        return resp.status(500).send({ error: 'Internal Server Error' });
    }
});

