import { Application } from "@hotwired/stimulus";
import { ToggleClassController } from "stimulus-library";
import ScoreFormController from "./controllers/score_form_controller.js";
import "./styles/main.css";

// Import Web Components
import "./components/game-store-provider.js";
import "./components/providers/game-provider.js";
import "./components/score-list.js";
import "./components/score.js";
import "./components/score-form.js";
import "./components/game-header.js";
import "./components/game-form.js";
import "./components/game-detail.js";
import "./components/game-player-name.js";
import "./components/player-list.js";
import "./components/games-list.js";

const application = Application.start();
application.register("toggle-class", ToggleClassController);
application.register("score-form", ScoreFormController);

window.Stimulus = application;
