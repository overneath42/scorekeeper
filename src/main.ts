import { Application } from "@hotwired/stimulus";
import { ToggleClassController } from "stimulus-library";
import "./styles/main.css";

// Import Web Components
import "./components/score-list.js";
import "./components/score.js";
import "./components/score-form.js";

const application = Application.start();
application.register("toggle-class", ToggleClassController);

window.Stimulus = application;
