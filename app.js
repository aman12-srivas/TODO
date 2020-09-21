//jshint esversion:6

const express = require("express");

const bodyParser = require("body-parser");

const mongoose=require("mongoose");

const _ =require("lodash")
;
const date = require(__dirname + "/date.js");


const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

const itemsSchema ={
  name:String
};

const workItems = [];

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"hello"
});
const item2=new Item({
  name:"and"
});
const item3=new Item({
  name:"welcome"
});
const defaultitems =[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

Item.insertMany(defaultitems,function(err){
  if (err){console.log(err);}
  else{console.log("Done");}
});
app.get("/", function(req, res) {
const day = date.getDate();
Item.find({},function(err,foundItems) {
if(foundItems.length === 0){
  Item.insertMany(defaultitems,function (err) {
    if(err)
    {
      console.log(err);
    }else{
      console.log("success");
    }
  });
  res.render("/");
}
else {
    res.render("list", {listTitle: "today", newListItems: foundItems});
}
});
});
app.get("/:customListName",function(req,res){
  const customListName =_.capitalize(req.params.customListName);
List.findOne({name:customListName},function (err,foundList) {
  if(!err){
    if(!foundList){
      const list=new List({
        name:customListName,
        items:defaultitems
      });
      list.save();
       res.redirect("/" + customListName);
    }else{
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});

});
app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName === "today")
  {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});
app.post("/delete", function(req, res){
  const checkedItemId= req.body.checkbox;
  const listName =req.body.listName;
  if(listName=== "today"){
  Item.findByIdAndRemove(checkedItemId,function(err) {
    if(!err){
      console.log("success");
      res.redirect("/");
    }
  });
}
else{
     List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}},function (err, foundList) {
  if(!err)
  {
    res.redirect("/"+ listName);
  }
});
}
  });



app.get("/about", function(req, res){
  res.render("about");
});
let port=process.env.PORT;
if(port == null || port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server has started.");
});
