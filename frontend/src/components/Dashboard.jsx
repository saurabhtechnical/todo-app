import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newTodoName, setNewTodoName] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/todos');
      setTodos(response.data);
    } catch (error) {
      setError('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async () => {
    if (!newTodoName.trim()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/todos', {
        name: newTodoName
      });
      setTodos([response.data, ...todos]);
      setNewTodoName('');
      setOpenDialog(false);
    } catch (error) {
      setError('Failed to create todo');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${todoId}`);
      setTodos(todos.filter(todo => todo._id !== todoId));
    } catch (error) {
      setError('Failed to delete todo');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCompletedCount = (items) => {
    return items.filter(item => item.completed).length;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Todo App
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.email}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            My Todo Lists
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            New Todo List
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {todos.map((todo) => (
            <Grid item xs={12} sm={6} md={4} key={todo._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {todo.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getCompletedCount(todo.items)} of {todo.items.length} items completed
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Created: {new Date(todo.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/todo/${todo._id}`)}
                  >
                    View Details
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteTodo(todo._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {todos.length === 0 && !loading && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="text.secondary">
              No todo lists yet. Create your first one!
            </Typography>
          </Box>
        )}
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Todo List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Todo List Name"
            fullWidth
            variant="outlined"
            value={newTodoName}
            onChange={(e) => setNewTodoName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateTodo()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTodo} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard; 
