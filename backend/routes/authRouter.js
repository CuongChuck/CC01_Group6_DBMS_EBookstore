import express from 'express';
import { mysqlConnection } from '../config.js';
import jwt from 'jsonwebtoken';

const authRouter = express.Router();

const verifyAdmin = (request, response, next) => {
    const token = request.cookies.token;
    if (!token) return response.json({message: "Token needed"});
    else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) return response.json({message: "Authentication Error."});
            const id = decoded.id;
            const sql = `SELECT * FROM User WHERE UserID = ${id}`;
            mysqlConnection.query(sql, [true], (err, results, fields) => {
                if (err) return response.status(500).json({message: err.message});
                if (results[0].Role.readUInt8(0) == 1) return response.json({message: "Authentication Error."});
            });
            next();
        });
    }
}

const verifyUser = (request, response, next) => {
    const token = request.cookies.token;
    if (!token) return response.json({message: "Token needed"});
    else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) return response.json({message: "Authentication Error."});
            const id = decoded.id;
            const sql = `SELECT * FROM User WHERE UserID = ${id}`;
            mysqlConnection.query(sql, [true], (err, results, fields) => {
                if (err) return response.status(500).json({message: err.message});
                if (results[0].Role.readUInt8(0) == 0) return response.json({message: "Authentication Error."});
            });
            next();
        });
    }
}

// Route for confirm log in
authRouter.get('/', verifyAdmin, (request, response) => {
    return response.json({status: "Admin Success"});
});

// Route for confirm log in
authRouter.get('/user', verifyUser, (request, response) => {
    return response.json({status: "User Success"});
});

// Route for logout
authRouter.get('/logout', (request, response) => {
    response.clearCookie('token');
    return response.json({message: "Success"});
});

// Route for Register
authRouter.post('/register', async (request, response) => {
    try {
        if (!request.body.email || !request.body.username || !request.body.password) {
            return response.status(400).send({
                message: "Send all required fields: email, username, password"
            });
        }
        const sql = `INSERT INTO User(Email, Username, Password, Role) VALUES(?,?,?,?)`;
        const values = [request.body.email, request.body.username, request.body.password];
        if (request.body.password == "1") {
            values.push(0);
        }
        else values.push(1);
        mysqlConnection.query(sql, values, (err, results, fields) => {
            if (err) return console.err(err.message);
            return response.status(201).send({
                message: `User ${values[1]} is inserted`
            });
        });
    } catch (err) {
        console.error(err.message);
        response.status(500).send({message: err.message});
    }
});

// Route for User list
authRouter.get('/user-list', async (request, response) => {
    try {
        const sql = `SELECT * FROM User`;
        mysqlConnection.query(sql, (err, results, fields) => {
            if (err) return response.status(404).send({message: err.message});
            return response.status(200).json({
                data: results
            });
        });
    } catch (err) {
        console.error(err.message);
        response.status(500).send({message: err.message});
    }
});

// Route for Log In
authRouter.post('/login', async (request, response) => {
    try {
        if (!request.body.username || !request.body.password) {
            return response.status(400).send({
                message: "Send all required fields: username, password"
            });
        }
        const sql = `SELECT * FROM User WHERE Username = ?`;
        mysqlConnection.query(sql, [request.body.username], (err, results, fields) => {
            if (err || results.length == 0 || request.body.password != results[0].Password)
                return response.status(404).json({status: "Failed"});
            else {
                const id = results[0].UserID;
                const token = jwt.sign({id}, "jwt-secret-key", {expiresIn: '1d'});
                response.cookie('token', token);
                if (results[0].Role.readUInt8(0) == 0) return response.status(200).json({status: "Admin Success"});
                else return response.status(200).json({status: "User Success"});
            }
        });
    } catch (err) {
        console.error(err.message);
        response.status(500).json({status: "Failed"});
    }
});

export default authRouter;