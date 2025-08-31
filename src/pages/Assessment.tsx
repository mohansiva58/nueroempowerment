/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { FormattedMessage, useIntl } from 'react-intl';


const dummyPicture = 'https://i0.wp.com/explainingbrains.com/wp-content/uploads/2024/08/Neurodiversity-Affirming-Assessment-workshop-1.png?resize=1080%2C1080&ssl=1';

interface Question {
  id: number;
  textKey: string;
}

const questions: Question[] = [
  { id: 1, textKey: "assessment.question_1" },
  { id: 2, textKey: "assessment.question_2" },
  { id: 3, textKey: "assessment.question_3" },
  { id: 4, textKey: "assessment.question_4" },
  { id: 5, textKey: "assessment.question_5" },
  { id: 6, textKey: "assessment.question_6" },
  { id: 7, textKey: "assessment.question_7" },
  { id: 8, textKey: "assessment.question_8" },
  { id: 9, textKey: "assessment.question_9" },
  { id: 10, textKey: "assessment.question_10" },
];

const predictNeurodiversity = (answers: Record<string, number>) => {
  const responses = Object.values(answers);
  const adhdScore = responses[0] + responses[3] + responses[6] + responses[9];
  const autismScore = responses[1] + responses[4] + responses[7];
  const dyslexiaScore = responses[2] + responses[5] + responses[8];

  let prediction = 'None';
  const probabilities: Record<string, number> = { ADHD: 0, Autism: 0, Dyslexia: 0, None: 0 };

  if (adhdScore >= 2) {
    prediction = 'ADHD';
    probabilities['ADHD'] = (adhdScore / 4) * 100;
    probabilities['Autism'] = (autismScore / 3) * 50;
    probabilities['Dyslexia'] = (dyslexiaScore / 3) * 50;
    probabilities['None'] = 10;
  } else if (autismScore >= 1) {
    prediction = 'Autism';
    probabilities['Autism'] = (autismScore / 3) * 100;
    probabilities['ADHD'] = (adhdScore / 4) * 50;
    probabilities['Dyslexia'] = (dyslexiaScore / 3) * 50;
    probabilities['None'] = 20;
  } else if (dyslexiaScore >= 1) {
    prediction = 'Dyslexia';
    probabilities['Dyslexia'] = (dyslexiaScore / 3) * 100;
    probabilities['ADHD'] = (adhdScore / 4) * 50;
    probabilities['Autism'] = (autismScore / 3) * 50;
    probabilities['None'] = 20;
  } else {
    probabilities['None'] = 100;
    probabilities['ADHD'] = (adhdScore / 4) * 30;
    probabilities['Autism'] = (autismScore / 3) * 30;
    probabilities['Dyslexia'] = (dyslexiaScore / 3) * 30;
  }

  return { prediction, probabilities };
};

const Assessment: React.FC = () => {
  const intl = useIntl();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [prediction, setPrediction] = useState<{ prediction: string; probabilities: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId - 1]: value,
    }));
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setError(null);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setError(null);
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        if (Object.keys(answers).length !== questions.length) {
          throw new Error(intl.formatMessage({ id: 'assessment.please_answer_all', defaultMessage: 'Please answer all questions' }));
        }
        const result = predictNeurodiversity(answers);
        setPrediction(result);
      } catch (err) {
        setError((err as Error).message || intl.formatMessage({ id: 'assessment.prediction_failed', defaultMessage: 'Prediction failed' }));
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setPrediction(null);
    setError(null);
    setLoading(false);
  };

  const handleContinue = async () => {
    if (prediction && user) {
      const categoryMap: Record<string, string> = {
        'ADHD': 'Cognitive',
        'Dyslexia': 'Reading',
        'Autism': 'Social',
        'None': 'All',
      };
      const predictedCategory = categoryMap[prediction.prediction] || 'All';

      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { predictedCategory }, { merge: true });
        navigate('/learning', { state: { predictedCategory } });
      } catch (error) {
        console.error("Error saving predicted category:", error);
        navigate('/learning', { state: { predictedCategory } });
      }
    } else {
      navigate('/learning');
    }
  };

  const yesNoOptions = [
    { labelKey: 'assessment.option.yes', value: 1 },
    { labelKey: 'assessment.option.no', value: 0 },
  ];

  const scrollVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-100 to-blue-50 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto" style={{ fontFamily: "'Open Dyslexic', sans-serif" }}>
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8">
        {/* Left Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scrollVariants}
          className="w-full lg:w-1/2 flex flex-col items-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 50, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-800 mb-4 sm:mb-9 text-center"
          >
            <FormattedMessage id="assessment.about_title" defaultMessage="About This Assessment" />
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 30, x: -50 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed text-center max-w-md"
          >
            <FormattedMessage id="assessment.description" defaultMessage="This Neurodiversity Assessment identifies traits of conditions like ADHD, Dyslexia, or Autism through simple yes/no questions. It's a user-friendly starting point for understanding your cognitive profile." />
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 30, x: -50 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="text-xs sm:text-sm text-gray-500 italic mb-6 sm:mb-8 text-center"
          >
            <FormattedMessage id="assessment.disclaimer" defaultMessage="Note: This is not a clinical diagnosis. Consult a healthcare professional for a full evaluation." />
          </motion.p>
          <motion.img
            src={dummyPicture}
            alt={intl.formatMessage({ id: 'assessment.neurodiversity_picture_alt', defaultMessage: 'Neurodiversity Picture' })}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 , y: 40, x: -50}}
            transition={{ delay: 0.3, type: 'spring', stiffness: 150, damping: 10 }}
            className="w-48 sm:w-64 lg:w-80 h-48 sm:h-64 lg:h-80 rounded-lg shadow-md"
          />
        </motion.div>

        {/* Right Section */}
        <motion.div
  initial="hidden"
  animate={{ scale: 1, x: 100, y: 50 }}
  whileInView="visible"
  viewport={{ once: true }}
  variants={scrollVariants}
  className="w-full lg:w-1/2 max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
>
          <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6 sm:p-8 text-center relative">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', x: -50 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold"
            >
              <FormattedMessage id="assessment.title" defaultMessage="Neurodiversity Assessment" />
            </motion.h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base opacity-90">
              <FormattedMessage id="assessment.subtitle" defaultMessage="Explore your traits" />
            </p>
          </header>

          <main className="p-6 sm:p-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {!prediction && (
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="space-y-6"
              >
                <div className="flex justify-center space-x-2 mb-4">
                  {questions.map((_, index) => (
                    <motion.div
                      key={index}
                      animate={{ scale: index === currentQuestionIndex ? 1.2 : 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${index <= currentQuestionIndex ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-gray-800 text-center">
                  <FormattedMessage id={questions[currentQuestionIndex].textKey} defaultMessage="" />
                </h3>

                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-4">
                  {yesNoOptions.map((option) => (
                    <motion.button
                      key={option.labelKey}
                      onClick={() => handleAnswerChange(questions[currentQuestionIndex].id, option.value)}
                      className={`w-full sm:w-auto px-6 py-2 sm:px-8 sm:py-3 rounded-full border-2 shadow-sm transition-all duration-300 ${
                        answers[questions[currentQuestionIndex].id - 1] === option.value
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
                      }`}
                      whileHover={{ scale: 1.1, boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                      disabled={loading}
                    >
                      <FormattedMessage id={option.labelKey} defaultMessage="" />
                    </motion.button>
                  ))}
                </div>

                <div className="flex justify-center space-x-4 mt-6">
                  {currentQuestionIndex > 0 && (
                    <motion.button
                      onClick={handlePrevious}
                      disabled={loading}
                      className={`w-full sm:w-auto px-6 py-2 sm:px-8 sm:py-3 rounded-full text-white font-semibold transition-all duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                      whileHover={{ scale: loading ? 1 : 1.1, boxShadow: loading ? 'none' : '0 6px 16px rgba(0, 0, 0, 0.15)' }}
                      whileTap={{ scale: loading ? 1 : 0.95 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    >
                      <FormattedMessage id="assessment.previous" defaultMessage="Previous" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {prediction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="mt-6 sm:mt-8 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-md text-center"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-indigo-700">
                    <FormattedMessage id="assessment.your_result" defaultMessage="Your Result" />
                  </h2>
                  <motion.p
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="text-2xl sm:text-3xl font-semibold text-indigo-600 mt-3"
                  >
                    {prediction.prediction}
                  </motion.p>
                  <div className="mt-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                      <FormattedMessage id="assessment.prediction_confidence" defaultMessage="Prediction Confidence" />
                    </h3>
                    <ul className="text-gray-600 mt-2 space-y-2">
                      {Object.entries(prediction.probabilities).map(([key, value]) => (
                        <motion.li
                          key={key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
                          className="flex justify-between text-sm sm:text-base"
                        >
                          <span>{key}</span>
                          <span className="font-medium">{value.toFixed(1)}%</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <motion.button
                      onClick={handleContinue}
                      className="w-full sm:w-auto px-6 py-2 sm:px-8 sm:py-3 rounded-full bg-green-600 text-white font-semibold transition-all duration-300 hover:bg-green-700"
                      whileHover={{ scale: 1.1, boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    >
                      <FormattedMessage id="assessment.continue_to_learning" defaultMessage="Continue to Learning" />
                    </motion.button>
                    <motion.button
                      onClick={handleRetake}
                      className="w-full sm:w-auto px-6 py-2 sm:px-8 sm:py-3 rounded-full bg-blue-600 text-white font-semibold transition-all duration-300 hover:bg-blue-700"
                      whileHover={{ scale: 1.1, boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    >
                      <FormattedMessage id="assessment.retake_test" defaultMessage="Retake Test" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </motion.div>
      </div>
    </div>
  );
};

export default Assessment;
