import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));
//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "sm9j2j5q6c8bpgyq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "ulbpxdogpfs1tts8",
    password: "sogvh6v66ifj0we3",
    database: "jszhk0i9zkqxpvf5",
    connectionLimit: 10,
    waitForConnections: true
});
//routes
app.get('/', async (req, res) => {
    let sql = `SELECT authorId, firstName, lastName
               FROM authors
               ORDER BY lastName`;
    const [authors] = await pool.query(sql);

    let sqlC = `SELECT DISTINCT category FROM quotes ORDER BY category`;
    const [categories] = await pool.query(sqlC);

    res.render("home.ejs", {authors, categories});
});
app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/searchByKeyword", async(req,res) => {
    try {
        console.log(req)
        let keyword = req.query.keyword;
        let sql =  `SELECT quote, firstName, lastName 
                    FROM quotes
                    NATURAL JOIN authors 
                    WHERE quote LIKE ? `;
        let sqlParams = [`%${keyword}%`];
        const [rows] = await pool.query(sql, sqlParams);
        res.render("quotes.ejs",{rows});
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/searchByAuthor", async(req,res) => {
    try {
        console.log(req);
        let authorId = req.query.authorId;
        console.log(authorId);
        let sql =  `SELECT quote, firstName, lastName 
                    FROM authors
                    NATURAL JOIN quotes
                    WHERE authorId LIKE ${authorId} `;
        const [rows] = await pool.query(sql);
        res.render("quotes.ejs",{rows});
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/searchByCategory", async(req,res) => {
    try {
        console.log(req)
        let category = req.query.category;
        let sql =  `SELECT quote, firstName, lastName FROM quotes NATURAL JOIN authors WHERE category LIKE "${category}"`;
        const [rows] = await pool.query(sql);
        res.render("quotes.ejs",{rows});
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/searchByLikes", async(req,res) => {
    try {
        console.log(req)
        let likes1 = req.query.num1;
        let likes2 = req.query.num2;
        let sql =  `SELECT quote, firstName, lastName, likes 
                    FROM quotes
                    NATURAL JOIN authors 
                    WHERE likes BETWEEN ${likes1} AND ${likes2}
                    ORDER BY likes DESC `;
        const [rows] = await pool.query(sql);
        res.render("likes.ejs",{rows});
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.listen(3000, ()=>{
    console.log("Express server running")
})