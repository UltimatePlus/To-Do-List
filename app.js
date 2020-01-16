const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _= require("lodash");
const mongoose = require("mongoose");
const app = express();
mongoose.connect("mongodb://localhost:27017/todolistDB", {useFindAndModify: false,useNewUrlParser: true, useUnifiedTopology: true });
const itemsSchema = new mongoose.Schema({
  name : String,
});
const Item =  mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemsSchema]
});
const List =  mongoose.model("List", listSchema);

const item1 = new Item ({
  name: "Wake up.."
});
const item2 = new Item ({
  name: "Drink Tea.."
});
const item3 = new Item ({
  name: "Feeling Tired..."
});

const defaultItems = [item1,item2,item3];

app.set("view engine","ejs");
app.listen(3000,function(){
  console.log("Server is started at port: 3000");
});
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.get("/",function(req,res){

  Item.find(function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log("error");
        }else{
          res.redirect("/");
        }
      });
    }else{
      res.render("list",{dayType : "Today" ,newListItems : foundItems});
    }
  });
});




app.post("/",function(req,res){
  const listName = req.body.buttonList;
  const itemName = req.body.newItem;
  const item = new Item ({
    name: itemName
  });
  if(listName!="Today")
  {
    List.findOne({name : listName},function(err, foundList){
      if(err){
        console.log("error");
      }else{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listName);
      }
    });
  }else{
    item.save();
    res.redirect("/");
  }
});

app.post("/delete",function(req,res){
    const checkboxId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndRemove(checkboxId,function(err){
          if(err){
            console.log("error");
          }else{
              setTimeout(function () {
                res.redirect("/");
              }, 500);
          }
        });
    }else{
      List.findOneAndUpdate({name : listName},{$pull: {items : {_id: checkboxId} } },function(err,results){
        if(err){
          console.log("error");
        }else{
            setTimeout(function () {
              res.redirect("/"+ listName);
            }, 500);
        }
      });
    }
});

app.get("/:customName",function(req,res){
  const customListName = _.capitalize(req.params.customName);
  List.findOne({name : customListName},function(err,results){
    if(err){
      console.log("error");
    }else{
        if(results){
          res.render("list",{dayType : results.name ,newListItems : results.items})
        }else{
            const list = new List ({
              name : customListName,
              items : defaultItems
            });
            list.save();
            res.redirect("/"+ customListName);
        }
    }
  });
});
