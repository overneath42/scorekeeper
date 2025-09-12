import { Application } from "@hotwired/stimulus";
import "./styles/main.css";

// Import Web Components
import "./components/providers/game-provider.js";
import "./components/providers/game-list-provider.js";

import "./components/game/gameboard.js";
import "./components/game/elements/score-form.js";
import "./components/game/elements/header.js";
import "./components/game/elements/scores.js";
import "./components/game/elements/score.js";
import "./components/game/elements/player-name.js";

import "./components/game-detail/form.js";
import "./components/game-detail/header.js";
import "./components/game-detail/player-list.js";

import "./components/games-list.js";

const application = Application.start();

window.Stimulus = application;
