import { Application } from "@hotwired/stimulus";
import { ToggleClassController } from "stimulus-library";
import "./styles/main.css";

// Import Web Components
import "./components/game-store-provider.js";
import "./components/score-list.js";
import "./components/score.js";
import "./components/score-form.js";
import "./components/game-header.js";
import "./components/game-player-name.js";

const application = Application.start();
application.register("toggle-class", ToggleClassController);

window.Stimulus = application;
