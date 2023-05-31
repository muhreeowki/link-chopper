import { useState } from "react";
import { nanoid } from "nanoid";
import { getDatabase, child, ref, get, set } from "firebase/database";
import { isWebUri } from "valid-url";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const Form = () => {
  // My url
  // Initialize form field
  const [formField, setFormField] = useState({
    longURL: "",
    preferedAlias: "",
    generatedURL: "",
    loading: false,
    formError: false,
    errorMessages: {},
    toolTipMessage: "Copy to Clipboard",
  });
  // HELPPER FUNCTIONS
  // Check if a key in the state has an error
  // returns true if there is error
  const checkForError = (key) => {
    const hasError = formField.errorMessages[key];
    if (hasError) return true;
    else return false;
  };

  // Save the content of the form as the user is typing
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormField((prevState) => ({ ...prevState, [id]: value }));
  };

  // Checks to see if the preferedAlias is already in the database
  const checkKeyExists = async () => {
    const dbRef = ref(getDatabase());
    return get(child(dbRef, `/${formField.preferedAlias}`)).catch(() => {
      return false;
    });
  };

  // Validate the users input
  const validateInput = async () => {
    // Remove previous error messages
    setFormField({ ...formField, formError: false, errorMessages: {} });
    // Initialize Variables
    let errors = [];
    let errorMessages = formField.errorMessages;

    // 1. Validate Long URL
    if (formField.longURL.length < 1) {
      errors.push("longURL");
      errorMessages["longURL"] = "Please Enter your URL.";
    } else if (!isWebUri(formField.longURL)) {
      errors.push("longURL");
      errorMessages["longURL"] =
        "Please input a URL in the form of 'https://www...'";
    } else {
      errorMessages.longURL = "";
    }

    // 2. Validate Prefered Alias
    if (formField.preferedAlias) {
      const re = new RegExp(`^[A-Za-z0-9]{3,5}$`); // Regular expressiong for the alias
      // Test the alias
      if (!re.test(formField.preferedAlias)) {
        console.log(`Invalid alias: ${formField.preferedAlias}`);
        errors.push("preferedAlias");
        errorMessages["preferedAlias"] =
          "The alias must be 3-5 characters long, and contain only letters and numbers.";
      }
      // Check if the key already exists
      var keyExists = await checkKeyExists();
      if (keyExists.exists()) {
        console.log("key exists");
        errors.push("preferedAlias");
        errorMessages["preferedAlias"] =
          "The Alias already exists, please enter another one.";
      }
    } else {
      errorMessages.preferedAlias = "";
    }

    if (errors.length > 0) {
      setFormField({ ...formField, loading: false, formError: true });
      return false;
    } else {
      setFormField({ ...formField, loading: false, errorMessages: {} });
      return true;
    }
  };

  // Copy the shortend URL to users clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formField.generatedURL);
    setFormField({ ...formField, toolTipMessage: "Copied" });
  };

  // Function to handle form submission
  const onSubmit = async (e) => {
    e.preventDefault(); //Prevents page from loading when the form is submited
    setFormField({
      ...formField,
      loading: true,
      generatedURL: "",
    }); // show loading icon, set generate url to empty so we dont use an old one
    // 1. Validate the input the user submitted
    const isFormValid = await validateInput();
    if (!isFormValid) return;
    // 2. Generate a short url
    // If the user inputed a prefered alias we will use it, if not will generate one.
    const alias = formField.preferedAlias;
    const generatedKey = alias !== "" ? alias : nanoid(5);
    console.log(generatedKey);
    const generatedURL = "linkchopper.com/" + generatedKey; // Domain might change
    // 3. Push generated url to db
    const db = getDatabase();
    set(ref(db, `/${generatedKey}`), {
      generatedKey: generatedKey,
      longURL: formField.longURL,
      preferedAlias: formField.preferedAlias,
      generatedURL: generatedURL,
    })
      .then(() => {
        setFormField({
          ...formField,
          generatedURL: generatedURL,
          loading: false,
        });
        console.log("pushed");
      })
      .catch((err) => {
        // Handle Error
        console.log(err)
      });
  };

  return (
    <div className="container">
      <form autoComplete="off">
        <h1 className="logo">Link Chopper</h1>

        {/* Long url input field */}
        <div className="form-group mb-2">
          <input
            id="longURL"
            onChange={handleChange}
            value={formField.longURL}
            type="url"
            required
            className={`form-control ${
              checkForError("longURL") ? "is-invalid" : ""
            }`}
            placeholder="Enter URL"
          />
        </div>

        {/* Long URL Error Message Field */}
        <div
          className={
            checkForError("longURL") ? "text-danger" : "visually-hidden"
          }
        >
          {formField.errorMessages.longURL}
        </div>

        {/* Alias Field */}
        <div className="">
          <div className="input-group mt-4 mb-2">
            <div className="input-group-prepend">
              <span className="input-group-text">linkchopper.com/</span>
            </div>
            <input
              id="preferedAlias"
              className={`form-control ${
                checkForError("preferedAlias") ? "is-invalid" : ""
              }`}
              onChange={handleChange}
              value={formField.preferedAlias}
              type="text"
              placeholder="Prefered Key (Optional)"
            />
          </div>

          {/* Alias Error Message Field */}
          {formField.formError ? (
            <div className={"text-danger"}>
              {formField.errorMessages.preferedAlias}
            </div>
          ) : (
            ""
          )}
        </div>

        {/* Generated URL */}
        {formField.generatedURL === "" ? (
          <div></div>
        ) : (
          <div className="generatedurl">
            <span>Your chopped URL is:</span>
            <div className="input-group">
              <input
                id="generatedURL"
                disabled
                type="text"
                value={formField.generatedURL}
                className="form-control"
              />
              <div className="input-group-append">
                <OverlayTrigger
                  key={"top"}
                  placement="top"
                  overlay={<Tooltip>{formField.toolTipMessage}</Tooltip>}
                >
                  <button
                    onClick={() => copyToClipboard()}
                    title="Tooltip on top"
                    className="btn-grad "
                    id="copy-btn"
                  >
                    Copy
                  </button>
                </OverlayTrigger>
              </div>
            </div>
          </div>
        )}
        {/* Button */}
        <button className="main-btn btn-grad" type="button" onClick={onSubmit}>
          {formField.loading ? (
            <div>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            </div>
          ) : (
            <div>
              <span
                className="visually-hidden spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span>Chop My Link</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default Form;
