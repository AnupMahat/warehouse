var express = require("express");
var methodOverride = require("method-override");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var User = require("./models/user");
var localStrategy = require("passport-local");
var passoportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost:27017/rico_logistics", {useNewUrlParser: true, useUnifiedTopology: true});

app.use(require("express-session")({
	secret: "Anoop is my name",
	resave: false,
	saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//SCHEMA SETUP
var stockSchema = new mongoose.Schema({
	name: String,
	qty: Number,
	critical: Number,
	ordered: Number,
	description: String
});

var stock = mongoose.model("stock", stockSchema);

//=======================
//ROUTES
//=======================

//ADD USER
// User.register(new User({username:"admin"}),"admin123", function(err,user){
// 	if(err){
// 		console.log(err);
// 	}
// 	passport.authenticate("local")
// });

app.get("/", function(req,res){
	res.render("landing.ejs");
});

//User Register

//login page
app.get("/login", function(req,res){
	res.render("loginpage");
});


//LOOGIN LOGIC
app.post("/login", passport.authenticate("local",{
	successRedirect: "/stocks",
	failureRedirect: "/login"
}), function(req,res){
	
});

//INDEX - show all Stocks
app.get("/stocks",isLoggedIn, function(req,res){
	if(req.query.search){
		var regex = new RegExp(escapeRegex(req.query.search), "gi");
		
		//get deasrched stocks from db
		stock.find({name: regex}, function(err,allstocks){
			if(err){
				console.log(err);
			}else{
				res.render("index.ejs",{stocks:allstocks});
			}
		});
	}else{
		//get all stocks from db
		stock.find({}, function(err,allstocks){
			if(err){
				console.log(err);
			}else{
				res.render("index.ejs",{stocks:allstocks});
			}
		});
	}
});

//CREATE - add new stock to DB
app.post("/stocks", function(req,res){
	//get data from form and add to stocks
	var name = req.body.name;
	var qty = req.body.qty;
	var critical = req.body.critical;
	var description = req.body.description;
	var newStock = {name:name, qty:qty, critical:critical, description:description}
	//create a new stock and save to database
	stock.create(newStock, function(err, newlyCreated){
		if(err){
			console.log(err);
		}else{
		//redirect back to stocks page
		res.redirect("/stocks");
		}
	});
});

//NEW - show form to create new stock
app.get("/stocks/new", function(req,res){
	res.render("new.ejs");
});

//SHOW = shows more info about one campground
app.get("/stocks/:id", function(req,res){
	//find a stock with provided 	ID
	stock.findById(req.params.id,function(err,foundStock){
		if(err){
			console.log(err);
		}else{
		// render show template with that stock
		res.render("show.ejs", {stock: foundStock});
		}
	});
});

//EDIT ROUTE
app.get("/stocks/:id/edit", function(req,res){
	//find a stock with provided 	ID
	stock.findById(req.params.id,function(err,foundStock){
		if(err){
			console.log(err);
		}else{
		// render show template with that stock
		res.render("edit.ejs", {stock: foundStock});
		}
	});
});

// UPDATE ROUTE
app.put("/stocks/:id", function(req,res){
	stock.findByIdAndUpdate(req.params.id,req.body.stock, function(err, updatedStock){
		if(err){
			console.log(err);
		}else{
			res.redirect("/stocks/"+req.params.id);
		}
	});
});

// DELETE ROUTE
app.delete("/stocks/:id", function(req,res){
	//DESTROY STOCK
	stock.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
		}else{
			//REDIRECT TO show page
			res.redirect("/stocks");
		}
	});
});

//ADD qty form ROUTE
app.get("/stocks/:id/add", function(req,res){
	//find a stock with provided 	ID
	stock.findById(req.params.id,function(err,foundStock){
		if(err){
			console.log(err);
		}else{
		// render show template with that stock
		res.render("add.ejs", {stock: foundStock});
		}
	});
});

//ADD QTY
app.put("/stocks/:id/add", function(req,res){
	var addqty = req.body.addqty;
	stock.findByIdAndUpdate(req.params.id,{ $inc: { qty: addqty }}, function(err, updatedStock){
		if(err){
			console.log(err);
		}else{
			res.redirect("/stocks/"+req.params.id);
		}
	});
});

//REDUCE qty form
app.get("/stocks/:id/reduce", function(req,res){
	//find a stock with provided 	ID
	stock.findById(req.params.id,function(err,foundStock){
		if(err){
			console.log(err);
		}else{
		// render show template with that stock
		res.render("reduce.ejs", {stock: foundStock});
		}
	});
});

//REDUCE QTY route
app.put("/stocks/:id/reduce", function(req,res){
	var reduceqty = req.body.reduceqty;
	stock.findByIdAndUpdate(req.params.id,{ $inc: { qty: -reduceqty }}, function(err, updatedStock){
		if(err){
			console.log(err);
		}else{
			res.redirect("/stocks/"+req.params.id);
		}
	});
});

//LOGOUT ROUTE
app.get("/logout", function(req,res){
	req.logout();
	res.redirect("/");
});

app.listen(3000,process.env.IP, function(){
	console.log("consumable management server has started........" );
});

//=============================
//FUNCTIONS
//=============================

//to clean search req
function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^\s]/g, "\\$&");
};

//to check login status to get inside control panel
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

//to check login status in loginpage to redirect to controlpanel

