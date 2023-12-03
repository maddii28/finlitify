import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer.js';
import './MenuPage1.css';
import axios from 'axios';


const MenuPage1 = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyVerified, setApiKeyVerified] = useState(false);
  const [question, setQuestion] = useState('');
  const inputStyle = {
    width: `${question.length * 8}px`, // Adjust the factor as needed (e.g., 8 pixels per character)
  };
  const type_variable = "Performance Analysis";
  const website_name = "https://fingpt-backend-07a26388d3cf.herokuapp.com/"; // Define your website name here
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const timestamp = new Date().toISOString();
      const questionNumberArray = [1, 2, 3, 4, 5];
      const requests = questionNumberArray.map((questionNumber) =>
        axios.post(`${website_name}/get-data`, { // Use the website_name variable in the URL
          timestamp,
          question_number: questionNumber,
          type: type_variable,
        })
      );
      console.log("Request made");
      const responses = await axios.all(requests);
      const updatedQuestions = responses.reduce((acc, response) => {
        if (response.data.status === 'success') {
          response.data.showAnswer = false; // Add showAnswer property
          acc.push(response.data);
        }
        return acc;
      }, []);
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const toggleAnswer = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].showAnswer = !updatedQuestions[index].showAnswer;
    setQuestions(updatedQuestions);
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file.type === 'text/csv') {
      // The file is a CSV file
      setSelectedFile(file);

      setErrorMessage('');
    } else {
      // The file is not a CSV file
      setSelectedFile(null);
      setErrorMessage('Please choose a CSV file.');
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile && apiKeyVerified) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('page_name', type_variable); // Replace with the actual page name
        formData.append('openai-id', apiKey); // Replace with the actual OpenAI key

        const response = await fetch(`${website_name}/validate-file`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.status === 'success') {
          console.log("successfull");
          setFileUploaded(true);
        } else {
          console.log('API call returned an error:', data.error);
        }
      } catch (error) {

        console.error('Error during API call:', error);
      }
    } else {
      console.log('No file selected or API key not verified.');
    }
  };

  const handleOpenAIKeyChange = (event) => {
    const key = event.target.value;
    setApiKey(key);
    setApiKeyVerified(false); // Reset the API key verification status when the key is changed
  };

  const verifyOpenAIKey = async () => {
    // Your OpenAI API key validation logic here
    // For example, you can make an API call to validate the key
    // and set apiKeyVerified based on the response
    const isValidKey = validateOpenAIKey(apiKey);
    setApiKeyVerified(isValidKey);
  };

  const validateOpenAIKey = async (key) => {
    try {
      const response = await fetch(`${website_name}/validate-openai-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'openai-id': key }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        console.log("API key verified");
        return true;
      } else {
        console.log("API key  not verified")
        return false;
      }
    } catch (error) {
      console.error('Error validating OpenAI key:', error);
      return false;
    }
  };

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleAskQuestion = () => {
    // Prepare the data to send
    const formData = new FormData();
    formData.append('openai-id', apiKey); // Replace apiKey with your actual API key
    formData.append('question', question);
    formData.append('file', selectedFile);

    // Make an API call to your backend
    fetch(`${website_name}/ask-a-question`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response from your backend here
        console.log('Response:', data);

        // Check if the status is 'success' or 'failure'
        const status = data.status;
        const message = data.message;

        // Get the HTML element where you want to display the answer
        const answerElement = document.getElementById('answerElementId');

        if (status === 'success') {
          // Display success message in green
          answerElement.innerHTML = `
            <div style="color: green;">
              <h3>Success!</h3>
              <p><strong>Question:<em></strong> ${question}</em></p>
              <p><strong>Answer:<em></strong> ${message}</em></p>
            </div>
          `;
        } else if (status === 'failure') {
          // Display failure message in red
          answerElement.innerHTML = `
            <div style="color: red;">
            <h3>Invalid Question. Try Again:</h3>
            <p><strong>Question:<em></strong> ${question}</em></p>
            <p><strong>Answer:<em></strong> ${message}</em></p>      
            </div>
          `;
        }
      })
      .catch(error => {
        // Handle errors, e.g., network issues
        console.error('Error:', error);
      });
  };
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      verifyOpenAIKey();
    }
  };

  return (
    <div className="container">
      <button className="back-button">
        <Link to="/" className="back-link">
          Back to Home
        </Link>
      </button>
      <h1>Performance Analysis</h1>
      <p>  Users can ask questions about the historical performance of their investment portfolios. They can inquire about the overall returns,
        individual asset performance, and compare their
        portfolio's performance to a benchmark or market index.
        The model can provide insights on the portfolio's
        performance over different time periods, highlight the best and worst-performing assets,
        and offer suggestions for improving performance</p>
      <p>Example user queries:<ul>
        <li>"How has my portfolio performed over the past year?"</li>
        <li>"What are the top-performing assets in my portfolio?"</li>
        <li>"Compare my portfolio's performance to the S&P 500 index."</li>
      </ul>
      </p>
      <div className="questions-container">
        {questions.map((question, index) => (
          <div key={index} className="question-container">
            <div className="question" onClick={() => toggleAnswer(index)}>
              {question.question}
            </div>
            {question.showAnswer && <div className="answer">{question.answer}</div>}
          </div>
        ))}
      </div>
      <p></p>
      {!apiKeyVerified ? (
        <div>
          <input
            type="text"
            placeholder="Enter your OpenAI key"
            value={apiKey}
            onChange={handleOpenAIKeyChange}
            onKeyDown={handleKeyPress}
          />
          <button onClick={verifyOpenAIKey}>Verify Key</button>
        </div>
      ) : (
        <div>
          <input
            className="submit-button:hover"
            type="file"
            onChange={handleFileChange}
            style={{ backgroundColor: '#fffff', color: 'white' }}
          />

          <button className="submit-button" onClick={handleFileUpload} style={{ color: 'white' }}>
            {fileUploaded ? 'File Uploaded' : 'Upload'}
          </button>
          {errorMessage && <p className="error-message" style={{ color: 'white' }}>{errorMessage}</p>}
        </div>

      )}
      {fileUploaded && (
        <div>
          <h2 style={{ color: 'white' }}>Ask a Question:</h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <textarea
              placeholder="Enter your question here"
              value={question}
              onChange={handleQuestionChange}
              style={{
                ...inputStyle,
                fontFamily: 'YourFontFamily, sans-serif',
                marginRight: '10px', // Add some space between textarea and button
                width: '400px',     // Adjust the width as needed
                height: '50px'      // Adjust the height as needed
              }}
            />
            <button
              style={{
                width: '100px',    // Adjust the width as needed
                height: '50px',    // Adjust the height as needed
                display: 'inline',
                textAlign: 'center',
              }}
              onClick={() => {
                handleAskQuestion();
                setQuestion(""); // Clear the textarea
              }}
            >
              Ask
            </button>
          </div>
          <div id="answerElementId"></div>
        </div>

      )}
      <Footer />
    </div>
  );
};
export default MenuPage1;
