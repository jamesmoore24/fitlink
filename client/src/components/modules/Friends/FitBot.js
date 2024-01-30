import React, { useState, useEffect, useRef } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { get, post } from "../../../utilities";
import "./FitBot.css";

import Profile from "../../../public/default_profile.png";
import FitBot from "../../../public/fitbot.png";

/**
 */
const ChatComponent = (props) => {
  const [postText, setPostText] = useState("");
  const [fadingOutIndex, setFadingOutIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const [runnable, setRunnable] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Calling");
      get("/api/isrunnable")
        .then((res) => {
          if (res.isrunnable) {
            setRunnable(true);
            clearInterval(intervalId); // Stop checking once it's runnable
          }
        })
        .catch((error) => {
          console.error("Error checking isrunnable: ", error);
          // Optionally handle errors, such as by retrying less frequently
        });
    }, 1000); // 2000 milliseconds = 2 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [props.messages]); // Runs whenever the props.messages array changes

  const [suggestions, setSuggestions] = useState([
    "Hello",
    "How can I help you?",
    "What is your query?",
    "Please type your question",
  ]);

  const addCorpus = () => {
    console.log("Setting corpus");
    post("api/document", { content: "Jimmy likes apples" }).then((newDoc) => {
      console.log("Corpus should be updated");
    });
  };

  const handleSend = () => {
    if (postText.trim()) {
      const newMessage = { id: Date.now(), text: postText, sender: "user" };
      const newPlaceholderMessage = { id: Date.now(), text: "Loading response...", sender: "bot" };
      props.setMessages([...props.messages, newMessage, newPlaceholderMessage]);
      sendMessageToBot(postText);
      setPostText("");
    }
  };

  const sendMessageToBot = (q) => {
    // Placeholder for sending message to RAG-based AI
    // This is where you would integrate with the AI service.
    // For now, we'll just mock a bot response.
    post("/api/query", { query: q })
      .then((res) => {
        const botResponse = {
          id: Date.now(),
          text: res.queryresponse,
          sender: "bot",
          imgSrc: FitBot,
        };
        props.setMessages((prevMessages) => prevMessages.slice(0, -1));
        props.setMessages((prevMessages) => [...prevMessages, botResponse]);
      })
      .catch(() => {
        setResponse("error during query. check your server logs!");
        setTimeout(() => {
          setResponse("");
        }, 2000);
      });
  };

  const ChatBubble = ({ text, isUser }) => (
    <div className={`chat-message ${isUser ? "user" : "bot"}`}>
      <img
        src={isUser ? props.user.profile_picture : FitBot}
        alt="Profile"
        className="chat-bubble-image"
      />
      <div className="chat-bubble-container">
        <div className={`chat-bubble-username ${isUser ? "user" : "bot"}`}>
          {isUser ? props.user.name : "FitBot"}
        </div>
        <div className={`chat-bubble ${isUser ? "user" : "bot"}`}>{text}</div>
      </div>
    </div>
  );

  const removeSuggestion = (indexToRemove) => {
    // Mark the suggestion as fading out
    setFadingOutIndex(indexToRemove);

    setPostText(suggestions[indexToRemove]);

    // Then, after a delay, remove the suggestion from the list
    setTimeout(() => {
      setSuggestions((currentSuggestions) =>
        currentSuggestions.filter((_, index) => index !== indexToRemove)
      );
      // Reset the fadingOutIndex since the item is now removed
      setFadingOutIndex(null);
    }, 500); // The timeout duration should match your CSS transition-duration
  };

  if (!runnable) {
    return <div className="fitbot-spinner-container"></div>;
  }
  return (
    <>
      <div className="fitbot-chat-container">
        {props.messages.length > 0 ? (
          <div className="fitbot-chat-messages">
            {props.messages.map((message) => (
              <ChatBubble key={message.id} text={message.text} isUser={message.sender === "user"} />
            ))}
            <div ref={props.messagesEndRef} /> {/* Invisible element at the end of the messages */}
          </div>
        ) : (
          <div className="fitbot-chat-container">
            <div className="fitbot-chat-empty-text">Try asking a fitness-related question!</div>
          </div>
        )}
      </div>
      <div className="fitbot-chatSuggestion-container">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`fitbot-chatSuggestion ${fadingOutIndex === index ? "fading-out" : ""}`}
            onClick={() => removeSuggestion(index)}
          >
            {suggestion}
          </div>
        ))}
      </div>
      <div className="fitbot-addCommentBox">
        <input
          className="fitbot-addCommentInput"
          placeholder="Ask a question.."
          value={postText} // Bind the input value to the state variable
          onChange={(e) => {
            setPostText(e.target.value);
          }} // Handle input changes
        />
        <button className="fitbot-addCommentPost" onClick={handleSend}>
          Post
        </button>
      </div>
    </>
  );
};

export default ChatComponent;