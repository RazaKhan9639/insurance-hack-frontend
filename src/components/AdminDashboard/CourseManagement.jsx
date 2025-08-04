import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  School,
  AttachFile,
  VideoLibrary,
} from '@mui/icons-material';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../../store/slices/courseSlice';

const CourseManagement = () => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  
  const { courses, loading, error, success } = useSelector((state) => state.course);

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    level: 'beginner',
    category: '',
    content: '',
    requirements: '',
    whatYouWillLearn: '',
    image: '',
    pdfUrl: '',
    videoUrl: '',
    isActive: true,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const validateUrl = (url) => {
    if (!url || url.trim() === '') return true; // Empty is valid
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!courseData.title.trim()) errors.title = 'Title is required';
    if (!courseData.description.trim()) errors.description = 'Description is required';
    if (!courseData.price || courseData.price <= 0) errors.price = 'Price must be greater than 0';
    if (!courseData.category.trim()) errors.category = 'Category is required';
    
    if (courseData.image && !validateUrl(courseData.image)) {
      errors.image = 'Please enter a valid image URL';
    }
    if (courseData.pdfUrl && !validateUrl(courseData.pdfUrl)) {
      errors.pdfUrl = 'Please enter a valid PDF URL';
    }
    if (courseData.videoUrl && !validateUrl(courseData.videoUrl)) {
      errors.videoUrl = 'Please enter a valid video URL';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('Courses state:', courses);
    console.log('Loading state:', loading);
    console.log('Error state:', error);
  }, [courses, loading, error]);

  const handleOpenDialog = (course = null) => {
    setValidationErrors({}); // Clear validation errors
    if (course) {
      setEditingCourse(course);
      setCourseData({
        title: course.title,
        description: course.description,
        price: course.price.toString(),
        duration: course.duration,
        level: course.level,
        category: course.category,
        content: course.content,
        requirements: Array.isArray(course.requirements) ? course.requirements.join('\n') : course.requirements,
        whatYouWillLearn: Array.isArray(course.whatYouWillLearn) ? course.whatYouWillLearn.join('\n') : course.whatYouWillLearn,
        image: course.image || '',
        pdfUrl: course.pdfUrl || '',
        videoUrl: course.videoUrl || '',
        isActive: course.isActive,
      });
    } else {
      setEditingCourse(null);
      setCourseData({
        title: '',
        description: '',
        price: '',
        duration: '',
        level: 'beginner',
        category: '',
        content: '',
        requirements: '',
        whatYouWillLearn: '',
        image: '',
        pdfUrl: '',
        videoUrl: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCourse(null);
    setValidationErrors({}); // Clear validation errors
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Don't submit if validation fails
    }

    const submitData = {
      ...courseData,
      price: parseFloat(courseData.price),
      requirements: courseData.requirements.split('\n').filter(req => req.trim()),
      whatYouWillLearn: courseData.whatYouWillLearn.split('\n').filter(item => item.trim()),
    };

    // Clean up empty URL fields to prevent validation errors
    if (!submitData.image || submitData.image.trim() === '') {
      delete submitData.image;
    }
    if (!submitData.pdfUrl || submitData.pdfUrl.trim() === '') {
      delete submitData.pdfUrl;
    }
    if (!submitData.videoUrl || submitData.videoUrl.trim() === '') {
      delete submitData.videoUrl;
    }

    if (editingCourse) {
      await dispatch(updateCourse({ courseId: editingCourse._id, courseData: submitData }));
    } else {
      await dispatch(createCourse(submitData));
    }
    
    if (success) {
      handleCloseDialog();
    }
  };

  const handleDeleteCourse = async () => {
    if (courseToDelete) {
      await dispatch(deleteCourse(courseToDelete._id));
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Course Management
        </Typography>
        <Fab
          color="primary"
          aria-label="add course"
          onClick={() => handleOpenDialog()}
        >
          <Add />
        </Fab>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Course {editingCourse ? 'updated' : 'created'} successfully!
        </Alert>
      )}
      
      {/* Courses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses && courses.length > 0 ? courses.map((course) => (
              course && (
                <TableRow key={course._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 50, height: 50, mr: 2, borderRadius: 1 }}
                        image={course.image || 'https://source.unsplash.com/random?course'}
                        alt={course.title || 'Course'}
                      />
                      <Box>
                        <Typography variant="subtitle2">{course.title || 'Untitled Course'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {course.description ? course.description.substring(0, 50) + '...' : 'No description available'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={course.category || 'General'} size="small" />
                  </TableCell>
                  <TableCell>£{course.price || 0}</TableCell>
                  <TableCell>
                    <Chip 
                      label={course.level || 'beginner'} 
                      size="small" 
                      color={course.level === 'beginner' ? 'success' : course.level === 'intermediate' ? 'warning' : 'error'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={course.isActive ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={course.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(course)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(course)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            )) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {loading ? 'Loading courses...' : 'No courses found'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Course Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Create New Course'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Title"
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                required
              />
              {validationErrors.title && (
                <Typography variant="caption" color="error">{validationErrors.title}</Typography>
              )}
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={courseData.price}
                onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
                required
                InputProps={{
                  startAdornment: '£',
                }}
              />
              {validationErrors.price && (
                <Typography variant="caption" color="error">{validationErrors.price}</Typography>
              )}
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration"
                value={courseData.duration}
                onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                placeholder="e.g., 20 hours"
                required
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={courseData.level}
                  label="Level"
                  onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={courseData.category}
                onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                required
              />
              {validationErrors.category && (
                <Typography variant="caption" color="error">{validationErrors.category}</Typography>
              )}
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={courseData.isActive}
                  label="Status"
                  onChange={(e) => setCourseData({ ...courseData, isActive: e.target.value })}
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                multiline
                rows={3}
                required
              />
              {validationErrors.description && (
                <Typography variant="caption" color="error">{validationErrors.description}</Typography>
              )}
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Course Content"
                value={courseData.content}
                onChange={(e) => setCourseData({ ...courseData, content: e.target.value })}
                multiline
                rows={4}
                placeholder="Describe the course content and materials..."
                required
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Requirements (one per line)"
                value={courseData.requirements}
                onChange={(e) => setCourseData({ ...courseData, requirements: e.target.value })}
                multiline
                rows={3}
                placeholder="Basic computer knowledge&#10;No programming experience required"
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="What You Will Learn (one per line)"
                value={courseData.whatYouWillLearn}
                onChange={(e) => setCourseData({ ...courseData, whatYouWillLearn: e.target.value })}
                multiline
                rows={3}
                placeholder="HTML5&#10;CSS3&#10;JavaScript&#10;React&#10;Node.js"
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Image URL"
                value={courseData.image}
                onChange={(e) => setCourseData({ ...courseData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                helperText="Enter a valid image URL (optional)"
                InputProps={{
                  startAdornment: <Visibility />,
                }}
              />
              {validationErrors.image && (
                <Typography variant="caption" color="error">{validationErrors.image}</Typography>
              )}
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="PDF URL"
                value={courseData.pdfUrl}
                onChange={(e) => setCourseData({ ...courseData, pdfUrl: e.target.value })}
                placeholder="https://example.com/course.pdf"
                helperText="Enter a valid PDF URL (optional)"
                InputProps={{
                  startAdornment: <AttachFile />,
                }}
              />
              {validationErrors.pdfUrl && (
                <Typography variant="caption" color="error">{validationErrors.pdfUrl}</Typography>
              )}
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Video URL"
                value={courseData.videoUrl}
                onChange={(e) => setCourseData({ ...courseData, videoUrl: e.target.value })}
                placeholder="https://example.com/course-video.mp4"
                helperText="Enter a valid video URL (optional)"
                InputProps={{
                  startAdornment: <VideoLibrary />,
                }}
              />
              {validationErrors.videoUrl && (
                <Typography variant="caption" color="error">{validationErrors.videoUrl}</Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCourse ? 'Update Course' : 'Create Course'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCourse} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseManagement; 