import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';

const TodoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    fetchTodo();
  }, [id]);

  const fetchTodo = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/todos/${id}`);
      setTodo(response.data);
    } catch (error) {
      setError('Failed to fetch todo');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    try {
      const response = await axios.post(`http://localhost:5000/api/todos/${id}/items`, {
        text: newItemText
      });
      setTodo(response.data);
      setNewItemText('');
    } catch (error) {
      setError('Failed to add item');
    }
  };

  const handleToggleItem = async (itemId, completed) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/todos/${id}/items/${itemId}`, {
        completed: !completed
      });
      setTodo(response.data);
    } catch (error) {
      setError('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/todos/${id}/items/${itemId}`);
      setTodo(response.data);
    } catch (error) {
      setError('Failed to delete item');
    }
  };

  const getCompletedCount = () => {
    if (!todo) return 0;
    return todo.items.filter(item => item.completed).length;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!todo) {
    return (
      <Container>
        <Alert severity="error">Todo not found</Alert>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {todo.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            {todo.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getCompletedCount()} of {todo.items.length} items completed
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Add new item"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              disabled={!newItemText.trim()}
            >
              Add
            </Button>
          </Box>
        </Paper>

        <List>
          {todo.items.map((item) => (
            <ListItem
              key={item._id}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
                backgroundColor: item.completed ? '#f5f5f5' : 'white'
              }}
            >
              <Checkbox
                edge="start"
                checked={item.completed}
                onChange={() => handleToggleItem(item._id, item.completed)}
                sx={{ mr: 2 }}
              />
              <ListItemText
                primary={item.text}
                sx={{
                  textDecoration: item.completed ? 'line-through' : 'none',
                  color: item.completed ? 'text.secondary' : 'text.primary'
                }}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => handleDeleteItem(item._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {todo.items.length === 0 && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="text.secondary">
              No items yet. Add your first item above!
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default TodoDetail; 