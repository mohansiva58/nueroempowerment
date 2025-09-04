import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpeechText } from '../components/speach';
import { supabaseHelpers } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Clock, Calendar, CheckCircle, PlayCircle, Search, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';


interface Course {
  titleKey: string;
  descriptionKey: string;
  status: "Completed" | "Upcoming" | "Watching";
  duration: string;
  progress?: string;
  category: string;
}

interface Event {
  type: "Webinar" | "Lesson" | "Task";
  titleKey: string;
  descriptionKey?: string;
  date: string;
  time?: string;
}

interface Resource {
  titleKey: string;
  type: "Article" | "Video" | "Tip";
  link?: string;
  descriptionKey: string;
}

const learningPlan: Course[] = [
  { titleKey: "learning.course.adhd_fundamentals", descriptionKey: "learning.desc.adhd_fundamentals", status: "Completed", duration: "00:45", category: "Cognitive" },
  { titleKey: "learning.course.time_management_adhd", descriptionKey: "learning.desc.time_management_adhd", status: "Watching", duration: "00:40", progress: "00:20", category: "Cognitive" },
  { titleKey: "learning.course.adhd_emotional_regulation", descriptionKey: "learning.desc.adhd_emotional_regulation", status: "Upcoming", duration: "00:35", category: "Mental Health" },
  { titleKey: "learning.course.dyslexia_reading_strategies", descriptionKey: "learning.desc.dyslexia_reading_strategies", status: "Completed", duration: "00:50", category: "Reading" },
  { titleKey: "learning.course.autism_social_communication", descriptionKey: "learning.desc.autism_social_communication", status: "Upcoming", duration: "00:30", category: "Social" },
  { titleKey: "learning.course.motor_skills_development", descriptionKey: "learning.desc.motor_skills_development", status: "Watching", duration: "00:25", progress: "00:15", category: "Motor Skills" },
  { titleKey: "learning.course.understanding_dyscalculia", descriptionKey: "learning.desc.understanding_dyscalculia", status: "Upcoming", duration: "00:40", category: "Mathematics" },
  { titleKey: "learning.course.ocd_coping_mechanisms", descriptionKey: "learning.desc.ocd_coping_mechanisms", status: "Completed", duration: "00:35", category: "Psychological" },
  { titleKey: "learning.course.bipolar_disorder_basics", descriptionKey: "learning.desc.bipolar_disorder_basics", status: "Upcoming", duration: "00:45", category: "Mental Health" },
  { titleKey: "learning.course.sensory_processing_skills", descriptionKey: "learning.desc.sensory_processing_skills", status: "Watching", duration: "00:30", progress: "00:10", category: "Perception" },
  { titleKey: "learning.course.down_syndrome_learning", descriptionKey: "learning.desc.down_syndrome_learning", status: "Upcoming", duration: "00:50", category: "Genetic" },
  { titleKey: "learning.course.anatomy_physiology", descriptionKey: "learning.desc.anatomy_physiology", status: "Completed", duration: "00:30", category: "Reading" },
  { titleKey: "learning.course.pharmacology_basics", descriptionKey: "learning.desc.pharmacology_basics", status: "Watching", duration: "00:30", progress: "00:30", category: "Social" },
  { titleKey: "learning.course.medical_ethics", descriptionKey: "learning.desc.medical_ethics", status: "Upcoming", duration: "00:30", category: "Neurological" },
  { titleKey: "learning.course.disease_pathophysiology", descriptionKey: "learning.desc.disease_pathophysiology", status: "Upcoming", duration: "00:30", category: "Motor Skills" },
];

const events: Event[] = [
  { type: "Webinar", titleKey: "learning.event.medical_research", descriptionKey: "", date: "Tu, 25.03", time: "12:30" },
  { type: "Lesson", titleKey: "learning.event.healthcare_systems", descriptionKey: "", date: "We, 26.03" },
  { type: "Task", titleKey: "learning.event.global_health", descriptionKey: "", date: "Th, 27.03" },
  { type: "Task", titleKey: "learning.event.teamwork_communication", descriptionKey: "", date: "Fr, 28.03" },
];

const categoryContent: Record<string, { descriptionKey: string; resources: Resource[] }> = {
  "All": {
    descriptionKey: "learning.category_desc.all",
    resources: [
      { titleKey: "learning.resource1.title", type: "Article", link: "https://www.neurodiversityhub.org/what-is-neurodiversity", descriptionKey: "learning.resource1.desc" },
      { titleKey: "learning.resource2.title", type: "Video", link: "https://www.youtube.com/watch?v=jKB2ulrHh0s", descriptionKey: "learning.resource2.desc" },
      { titleKey: "learning.resource6.title", type: "Tip", descriptionKey: "learning.resource6.desc" },
    ],
  },
  "Cognitive": {
    descriptionKey: "learning.category_desc.cognitive",
    resources: [
      { titleKey: "learning.resource3.title", type: "Article", link: "https://www.additudemag.com/adhd-coping-skills/", descriptionKey: "learning.resource3.desc" },
      { titleKey: "learning.resource4.title", type: "Video", link: "https://www.youtube.com/watch?v=hFL6qRIJZ_Y", descriptionKey: "learning.resource4.desc" },
      { titleKey: "learning.resource5.title", type: "Tip", descriptionKey: "learning.resource5.desc" },
    ],
  },
};

const Learning: React.FC = () => {
  const intl = useIntl();
  const { user } = useAuth();
  const location = useLocation();
  const [completion, setCompletion] = useState<{ [key: string]: number }>({});
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  useEffect(() => {
    // Simulate predicted category from location state or default to "All"
    const predictedCategoryFromState = (location.state as { predictedCategory?: string })?.predictedCategory;
    const finalPredictedCategory = predictedCategoryFromState || "All";
    setSelectedCategory(finalPredictedCategory);

    // Auto-enroll recommended course for predicted category
    if (finalPredictedCategory !== "All") {
      const recommendedCourse = learningPlan.find(course => course.category === finalPredictedCategory);
      if (recommendedCourse && !enrolledCourses.has(recommendedCourse.titleKey)) {
        setEnrolledCourses(new Set([...enrolledCourses, recommendedCourse.titleKey]));
        setCompletion(prev => ({ ...prev, [recommendedCourse.titleKey]: 0 }));
      }
    }
    setIsLoading(false);
    // eslint-disable-next-line
  }, [location.state]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          setIsLoading(true);
          // Supabase: fetch user data from 'users' table
          const { data: userData, error } = await supabaseHelpers
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          let enrolledFromSupabase: string[] = [];
          let completionFromSupabase: { [key: string]: number } = {};
          let predictedCategoryFromSupabase: string = "All";

          if (userData) {
            enrolledFromSupabase = userData.enrolled || [];
            completionFromSupabase = userData.completion || {};
            predictedCategoryFromSupabase = userData.predictedCategory || "All";
          }

          setEnrolledCourses(new Set(enrolledFromSupabase));
          setCompletion(completionFromSupabase);
          const predictedCategoryFromState = (location.state as { predictedCategory?: string })?.predictedCategory;
          const finalPredictedCategory = predictedCategoryFromState || predictedCategoryFromSupabase;
          setSelectedCategory(finalPredictedCategory);

          if (finalPredictedCategory !== "All") {
            const recommendedCourse = learningPlan.find(course => course.category === finalPredictedCategory);
            if (recommendedCourse && !enrolledFromSupabase.includes(recommendedCourse.titleKey)) {
              const newEnrolled = new Set([...enrolledFromSupabase, recommendedCourse.titleKey]);
              setEnrolledCourses(newEnrolled);
              const newCompletion = { ...completionFromSupabase, [recommendedCourse.titleKey]: 0 };
              setCompletion(newCompletion);
              await supabaseHelpers
                .from("users")
                .update({ enrolled: Array.from(newEnrolled), completion: newCompletion })
                .eq("id", user.id);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setSelectedCategory("All");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, location.state]);

  const updateUserData = async (newEnrolled: Set<string>, newCompletion: { [key: string]: number }) => {
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { enrolled: Array.from(newEnrolled), completion: newCompletion }, { merge: true });
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    }
  };

  const handleEnroll = async (courseTitleKey: string) => {
    const newEnrolled = new Set(enrolledCourses);
    const newCompletion = { ...completion };

    if (newEnrolled.has(courseTitleKey)) {
      newEnrolled.delete(courseTitleKey);
      delete newCompletion[courseTitleKey];
    } else {
      newEnrolled.add(courseTitleKey);
      newCompletion[courseTitleKey] = 0;
    }

    setEnrolledCourses(newEnrolled);
    setCompletion(newCompletion);
    await updateUserData(newEnrolled, newCompletion);
  };

  const openPopup = (url: string) => {
    // Convert YouTube URL to embed format
    let embedUrl = url;
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    } else if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    }
    setVideoUrl(embedUrl);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setVideoUrl(null);
  };

  const filteredCourses = learningPlan.filter(course => {
    const titleText = intl.formatMessage({ id: course.titleKey, defaultMessage: '' });
    const descriptionText = intl.formatMessage({ id: course.descriptionKey, defaultMessage: '' });
    return (selectedCategory === "All" || course.category === selectedCategory) &&
      (titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
       descriptionText.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.02, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)", transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const relatedContentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15, ease: "easeIn" } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 1, ease: "easeInOut", delay: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, backgroundColor: "#16a34a", transition: { duration: 0.3, ease: "easeInOut" } },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
  };

  const searchBarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <SpeechText>
          <FormattedMessage id="learning.loading" defaultMessage="Loading..." />
        </SpeechText>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div variants={searchBarVariants} initial="hidden" animate="visible" className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder={intl.formatMessage({ 
                    id: 'learning.search_placeholder', 
                    defaultMessage: 'Search courses...' 
                  })}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </motion.div>

            <motion.div className="flex justify-between items-center mb-6" variants={cardVariants}>
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <SpeechText>
                  <FormattedMessage id="learning.my_learning_plan" defaultMessage="My Learning Plan" />
                </SpeechText>
                <Clock className="h-5 w-5 ml-2 text-gray-500" />
              </h2>
              <div className="flex space-x-4">
                <motion.div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <span className="font-bold">{filteredCourses.length}</span> <FormattedMessage id="learning.total" defaultMessage="Total" />
                </motion.div>
                <motion.div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <span className="font-bold">{filteredCourses.filter(c => c.status === "Completed").length}</span> <FormattedMessage id="learning.completed" defaultMessage="Completed" />
                </motion.div>
                <motion.div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <span className="font-bold">{filteredCourses.filter(c => c.status === "Upcoming").length}</span> <FormattedMessage id="learning.upcoming" defaultMessage="Upcoming" />
                </motion.div>
              </div>
            </motion.div>

            <div className="relative">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <div key={index} className="relative mb-6">
                    {index < filteredCourses.length - 1 && (
                      <motion.svg className="absolute left-6 top-16 h-24 w-0" initial="hidden" animate="visible">
                        <motion.line x1="0" y1="0" x2="0" y2="96" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4" variants={lineVariants} />
                      </motion.svg>
                    )}
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      className={`bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 ${course.status === "Watching" ? "bg-purple-50" : ""}`}
                    >
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
                        {course.status === "Completed" ? (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : course.status === "Watching" ? (
                          <PlayCircle className="h-8 w-8 text-purple-500" />
                        ) : (
                          <Calendar className="h-8 w-8 text-gray-400" />
                        )}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          <SpeechText>
                            <FormattedMessage id={course.titleKey} defaultMessage={course.titleKey} />
                          </SpeechText>
                        </h3>
                        <p className="text-gray-600 text-sm">
                          <SpeechText>
                            <FormattedMessage id={course.descriptionKey} defaultMessage={course.descriptionKey} />
                          </SpeechText>
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-gray-500 text-sm">
                            <SpeechText>
                              {course.status === "Completed" && <FormattedMessage id="learning.completed" defaultMessage="Completed" />}
                              {course.status === "Upcoming" && <FormattedMessage id="learning.upcoming" defaultMessage="Upcoming" />}
                              {course.status === "Watching" && <FormattedMessage id="learning.watching" defaultMessage="Watching" />}
                            </SpeechText>
                          </span>
                          {course.status === "Watching" && (
                            <span className="text-gray-500 text-sm">
                              <SpeechText>
                                <FormattedMessage 
                                  id="learning.watching_progress" 
                                  defaultMessage="Watching {progress}"
                                  values={{ progress: course.progress }}
                                />
                              </SpeechText>
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.button
                        onClick={() => handleEnroll(course.titleKey)}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${enrolledCourses.has(course.titleKey) ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                      >
                        <SpeechText>
                          {enrolledCourses.has(course.titleKey) ? (
                            <FormattedMessage id="common.unenroll" defaultMessage="Unenroll" />
                          ) : (
                            <FormattedMessage id="common.enroll_now" defaultMessage="Enroll Now" />
                          )}
                        </SpeechText>
                      </motion.button>
                    </motion.div>

                    <AnimatePresence>
                      {enrolledCourses.has(course.titleKey) && (
                        <motion.div variants={relatedContentVariants} initial="hidden" animate="visible" exit="exit" className="mt-4 ml-16">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            <SpeechText>
                              <FormattedMessage 
                                id="learning.related_content" 
                                defaultMessage="Related Content for {courseTitle}"
                                values={{ 
                                  courseTitle: intl.formatMessage({ id: course.titleKey, defaultMessage: course.titleKey })
                                }}
                              />
                            </SpeechText>
                          </h4>
                          <div className="space-y-4">
                            {categoryContent[course.category]?.resources.map((resource, resIndex) => (
                              <motion.div
                                key={resIndex}
                                variants={cardVariants}
                                whileHover="hover"
                                className={`rounded-xl shadow-md p-4 ${resource.type === "Article" ? "bg-green-50" : resource.type === "Video" ? "bg-blue-50" : "bg-yellow-50"}`}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-semibold text-gray-700">
                                    <SpeechText>{resource.type}</SpeechText>
                                  </span>
                                </div>
                                <h5 className="text-md font-semibold text-gray-800">
                                  <SpeechText>
                                    <FormattedMessage id={resource.titleKey} defaultMessage={resource.titleKey} />
                                  </SpeechText>
                                </h5>
                                <p className="text-gray-600 text-sm mt-1">
                                  <SpeechText>
                                    <FormattedMessage id={resource.descriptionKey} defaultMessage={resource.descriptionKey} />
                                  </SpeechText>
                                </p>
                                {resource.link && (
                                  resource.type === "Video" ? (
                                    <motion.button
                                      onClick={() => openPopup(resource.link!)}
                                      variants={buttonVariants}
                                      whileHover="hover"
                                      whileTap="tap"
                                      className="mt-2 inline-block px-4 py-1 bg-blue-600 text-white rounded-lg text-sm"
                                    >
                                      <SpeechText>
                                        <FormattedMessage id="learning.watch_video" defaultMessage="Watch Video" />
                                      </SpeechText>
                                    </motion.button>
                                  ) : (
                                    <motion.a
                                      href={resource.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      variants={buttonVariants}
                                      whileHover="hover"
                                      whileTap="tap"
                                      className="mt-2 inline-block px-4 py-1 bg-blue-600 text-white rounded-lg text-sm"
                                    >
                                      <SpeechText>
                                        <FormattedMessage 
                                          id="home.learn_more" 
                                          defaultMessage="Learn More" 
                                        />
                                      </SpeechText>
                                    </motion.a>
                                  )
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-center text-gray-600">
                  <SpeechText>
                    <FormattedMessage 
                      id="learning.no_courses" 
                      defaultMessage="No courses found matching your search or category." 
                    />
                  </SpeechText>
                </motion.div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.h2 variants={cardVariants} className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <SpeechText>
                  <FormattedMessage id="learning.my_events" defaultMessage="My Events" />
                </SpeechText>
                <span className="ml-2">ðŸŽ‰</span>
              </motion.h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {events.map((event, index) => (
                    <motion.div
                      key={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: 20 }}
                      whileHover="hover"
                      className={`rounded-xl shadow-md p-4 ${event.type === "Webinar" ? "bg-blue-50" : event.type === "Lesson" ? "bg-purple-50" : "bg-yellow-50"}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          <SpeechText>
                            {event.type === "Webinar" && <FormattedMessage id="learning.event_type.webinar" defaultMessage="Webinar" />}
                            {event.type === "Lesson" && <FormattedMessage id="learning.event_type.lesson" defaultMessage="Lesson" />}
                            {event.type === "Task" && <FormattedMessage id="learning.event_type.task" defaultMessage="Task" />}
                          </SpeechText>
                        </span>
                        <span className="text-sm text-gray-600">
                          <SpeechText>{event.date}</SpeechText>
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        <SpeechText>
                          <FormattedMessage id={event.titleKey} defaultMessage={event.titleKey} />
                        </SpeechText>
                      </h3>
                      {event.descriptionKey && (
                        <p className="text-gray-600 text-sm mt-1">
                          <SpeechText>
                            <FormattedMessage id={event.descriptionKey} defaultMessage={event.descriptionKey} />
                          </SpeechText>
                        </p>
                      )}
                      {event.time && (
                        <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" className="mt-2 px-4 py-1 bg-gray-200 text-gray-800 rounded-lg text-sm">
                          <SpeechText>
                            <FormattedMessage 
                              id="learning.start_at" 
                              defaultMessage="Start at" 
                            /> {event.time}
                          </SpeechText>
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.h2 variants={cardVariants} className="text-2xl font-semibold text-gray-800 mt-8 mb-6 flex items-center">
                <SpeechText>
                  <FormattedMessage id="learning.resources" defaultMessage="Resources" />
                </SpeechText>
                <span className="ml-2">ðŸ“š</span>
              </motion.h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {categoryContent[selectedCategory]?.resources.map((resource, index) => (
                    <motion.div
                      key={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: 20 }}
                      whileHover="hover"
                      className={`rounded-xl shadow-md p-4 ${resource.type === "Article" ? "bg-green-50" : resource.type === "Video" ? "bg-blue-50" : "bg-yellow-50"}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          <SpeechText>
                            {resource.type === "Article" && <FormattedMessage id="learning.resource_type.article" defaultMessage="Article" />}
                            {resource.type === "Video" && <FormattedMessage id="learning.resource_type.video" defaultMessage="Video" />}
                            {resource.type === "Tip" && <FormattedMessage id="learning.resource_type.tip" defaultMessage="Tip" />}
                          </SpeechText>
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        <SpeechText>
                          <FormattedMessage id={resource.titleKey} defaultMessage={resource.titleKey} />
                        </SpeechText>
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        <SpeechText>
                          <FormattedMessage id={resource.descriptionKey} defaultMessage={resource.descriptionKey} />
                        </SpeechText>
                      </p>
                      {resource.link && (
                        resource.type === "Video" ? (
                          <motion.button
                            onClick={() => openPopup(resource.link!)}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="mt-2 inline-block px-4 py-1 bg-blue-600 text-white rounded-lg text-sm"
                          >
                            <SpeechText>
                              <FormattedMessage id="learning.watch_video" defaultMessage="Watch Video" />
                            </SpeechText>
                          </motion.button>
                        ) : (
                          <motion.a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="mt-2 inline-block px-4 py-1 bg-blue-600 text-white rounded-lg text-sm"
                          >
                            <SpeechText>
                              <FormattedMessage id="home.learn_more" defaultMessage="Learn More" />
                            </SpeechText>
                          </motion.a>
                        )
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isPopupOpen && (
            <>
              <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={closePopup}
              >
                <motion.div
                  variants={popupVariants}
                  className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
                    {videoUrl && (
                      <iframe
                        src={videoUrl}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video Player"
                      />
                    )}
                  </div>
                  <motion.button
                    onClick={closePopup}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-4 right-4 bg-red-600 text-white rounded-full p-2 shadow-lg z-10"
                    aria-label="Close video"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Learning;
