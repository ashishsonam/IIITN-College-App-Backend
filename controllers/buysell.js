const express = require("express");
const buysell = require("../models/buysell");

exports.addItem = (req ,res) => {
    const item  = req.body;
    // console.log(item);
    let newItem = buysell({
        itemName:item.itemName,
        itemPrice:item.itemPrice,
        itemImageUri:item.itemImageUri,
        sellerName:item.sellerName,
        sellerRoom:item.sellerRoom,
        sellerContact:item.sellerContact,
        email:req.user.email
    });
    newItem.save(function(err,item){
        if(err){
            res.status(400).json({ success: false, msg: "Failed to save the item" });
        }
        else{
           res.status(200).json({ success: true, msg: "Successfully Added",item:item});
        }
    });
};

exports.myItems = (req ,res) => {
    const  email = req.user.email;
    buysell.find({email: email}).exec((err,list) => {
        if(err)
        {
            res.status(400).json({ err });
        }
        else 
        {  
            res.status(200).json({success: true, list:list});
        }
    });
};

exports.allItems = (req , res) => {
    buysell.find({}).exec((err,list) => {
        if(err){
            res.status(400).json({ success: false, msg: "Failed to retrive the item" });
        }
        else{
           res.status(200).json({success: true, list:list});
        }
    });
}

exports.deleteItem = (req, res) => {
    const itemId = req.body.id;
    buysell.findByIdAndDelete({_id:itemId}).exec((err) => {
        if(err){
            res.status(400).json({ success: false, msg: "Failed to delete the item" });
        }
        else{
            console.log("Successfully deleted item");
           res.status(200).json({ success: true, msg: "Successfully deleted item"});
        }
    })
}