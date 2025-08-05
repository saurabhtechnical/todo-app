const express = require('express');
const { body, validationResult } = require('express-validator');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all todos for a user
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new todo list
router.post('/', [
  auth,
  body('name').notEmpty().trim().withMessage('Todo name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const todo = new Todo({
      name,
      user: req.user._id,
      items: []
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific todo list
router.get('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a todo list
router.put('/:id', [
  auth,
  body('name').notEmpty().trim().withMessage('Todo name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a todo list
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new item to a todo list
router.post('/:id/items', [
  auth,
  body('text').notEmpty().trim().withMessage('Item text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    todo.items.push({ text });
    await todo.save();
    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a todo item
router.put('/:id/items/:itemId', [
  auth,
  body('text').optional().trim(),
  body('completed').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, completed } = req.body;
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const item = todo.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (text !== undefined) item.text = text;
    if (completed !== undefined) item.completed = completed;

    await todo.save();
    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a todo item
router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const item = todo.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    todo.items.pull(item._id);
    await todo.save();
    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 