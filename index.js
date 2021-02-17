const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const session = require("express-session");

// Importing Controllers ///////////////////////////
const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./user/UserController");

// Importing Models ///////////////////////////
const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./user/User");

// View Engine ///////////////////////////
app.set('view engine', 'ejs');

// Sessions ///////////////////////////
app.use(session({
    secret: "803a41bb5ce6c9e726a3140caba4214b", //not much secure md5 hash...
    cookie: {maxAge: 3000000}
}));

// Static ///////////////////////////
app.use(express.static('public'));

// Body Parser ///////////////////////////
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Database ///////////////////////////
connection.authenticate().then(() => {
    console.log("[+] Database ON");
}).catch((error) => {
    console.log(error);
});

// categoriesController ///////////////////////////
app.use("/", categoriesController);

// articlesController ///////////////////////////
app.use("/", articlesController);

// usersController ///////////////////////////
app.use("/", usersController);

// Index ///////////////////////////
app.get("/",(req,res) => {

    Article.findAll({
        order: [["id","DESC"]],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index", {articles: articles, categories: categories});
        })
        
    })

});

// Read Article ///////////////////////////
app.get("/:slug", (req,res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {slug: slug}
    }).then(article => {
        if(article != undefined){
            Category.findAll().then(categories => {
                res.render("article", {article: article, categories: categories});
            })
        }
        else{
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/");
    })
})

// Filter Articles By Category ///////////////////////////
app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug;
    Category.findOne({
        where: {slug: slug},
        include: [{model: Article}]
    }).then(category => {
        if(category != undefined){
            Category.findAll().then(categories => {
                res.render("index", {articles: category.articles, categories: categories})
            })
        }else{
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/");
    })
})

// Initialize Server ///////////////////////////
app.listen(8080, () => {
    console.log("[+] Server ON");
});
