import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  PlayArrow,
  School,
  Star,
  AccessTime,
  Person,
  CheckCircle,
  VideoLibrary,
  Description,
  Download,
  Edit,
  Delete,
} from '@mui/icons-material';
import { fetchCourses, getCourseById, enrollInCourse, getCourseContent } from '../../store/slices/courseSlice';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [course, setCourse] = useState(null);
  const [courseContent, setCourseContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const { courses, enrolledCourses, currentCourse, courseContent: content, loading: courseLoading } = useSelector((state) => state.course);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        console.log('Course ID from params:', id);
        if (id) {
          console.log('Fetching course with ID:', id);
          await dispatch(getCourseById(id));
          await dispatch(fetchCourses());
        } else {
          console.error('No course ID provided');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, dispatch]);

  useEffect(() => {
    if (currentCourse) {
      setCourse(currentCourse);
    }
  }, [currentCourse]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await dispatch(enrollInCourse(id));
      // Refresh enrolled courses
      await dispatch(fetchCourses());
    } catch (error) {
      console.error('Error enrolling:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleViewContent = async () => {
    try {
      await dispatch(getCourseContent(id));
      setShowContent(true);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const isEnrolled = enrolledCourses.some(enrolledCourse => enrolledCourse._id === id);

  if (loading || courseLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Course not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Course Header */}
        <Grid item xs={12}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={course.image || 'https://source.unsplash.com/random?course'}
              alt={course.title}
            />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="primary">
                  £{course.price}
                </Typography>
                <Chip label={course.category || 'General'} color="secondary" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip label={course.category} color="primary" />
                    <Chip label={course.level} color="secondary" />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ color: 'warning.main', mr: 0.5 }} />
                      <Typography variant="body2">4.5 (120 reviews)</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    £{course.price}
                  </Typography>
                  {isEnrolled ? (
                    <Chip label="Enrolled" color="success" />
                  ) : user?.role !== 'admin' ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<School />}
                      onClick={() => navigate(`/payment/${id}`)}
                    >
                      Buy Now
                    </Button>
                  ) : null}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Course Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What you'll learn
              </Typography>
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? (
                <List>
                  {course.whatYouWillLearn.map((item, index) => (
                    <ListItem key={index} dense>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Course learning objectives will be available soon.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Content
              </Typography>
              {course.content ? (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {course.content}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Course content will be available after enrollment.
                </Typography>
              )}
            </CardContent>
          </Card>

          {course.requirements && course.requirements.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Requirements
                </Typography>
                <List>
                  {course.requirements.map((requirement, index) => (
                    <ListItem key={index} dense>
                      <ListItemIcon>
                        <CheckCircle color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={requirement} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Course Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Duration: {course.duration}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Level: {course.level}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Category: {course.category}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {isEnrolled && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Access
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<VideoLibrary />}
                  onClick={handleViewContent}
                  sx={{ mb: 2 }}
                >
                  View Course Content
                </Button>
                {course.videoUrl && (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PlayArrow />}
                    onClick={() => window.open(course.videoUrl, '_blank')}
                    sx={{ mb: 2 }}
                  >
                    Watch Video
                  </Button>
                )}
                {course.pdfUrl && (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Download />}
                    onClick={() => window.open(course.pdfUrl, '_blank')}
                  >
                    Download PDF
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Actions */}
          {user?.role === 'admin' && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Admin Actions
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Edit />}
                  onClick={() => navigate(`/admin/courses/${id}/edit`)}
                  sx={{ mb: 2 }}
                >
                  Edit Course
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Delete />}
                  color="error"
                >
                  Delete Course
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Course Content Dialog */}
      <Dialog open={showContent} onClose={() => setShowContent(false)} maxWidth="md" fullWidth>
        <DialogTitle>Course Content</DialogTitle>
        <DialogContent>
          {content ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {content}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Loading course content...
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowContent(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseDetails; 