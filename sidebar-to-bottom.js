(function () {
	"use strict";

	var TOP_ID = "sidebar-top-wrapper";
	var BOTTOM_ID = "sidebar-bottom-wrapper";
	var BODY_CLASS = "sidebar-at-bottom";

	/* ── Ensure $options.sidebarToBottom exists ───────────── */

	function initOption() {
		if (
			window.V &&
			V.options &&
			typeof V.options.sidebarToBottom === "undefined"
		) {
			V.options.sidebarToBottom = false;
		}
	}

	$(document).one(":storyready", initOption);
	$(document).one(":passagestart", initOption);

	/* ── Inject checkbox into Options > General > Sidebar ── */

	var observer = new MutationObserver(function () {
		tryInjectSetting();
	});
	observer.observe(document.documentElement, { childList: true, subtree: true });

	function tryInjectSetting() {
		if (document.getElementById("stb-toggle")) return;

		var overlayContent = document.getElementById("customOverlayContent");
		if (!overlayContent) return;

		var headers = overlayContent.querySelectorAll(".settingsHeader.options");
		if (headers.length < 2) return;

		var sidebarHeader = headers[1];
		var settingsGrid = sidebarHeader.closest(".settingsGrid");
		if (!settingsGrid) return;

		var item = document.createElement("div");
		item.className = "settingsToggleItem";

		var label = document.createElement("label");
		var checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = "stb-toggle";
		checkbox.checked = !!(V && V.options && V.options.sidebarToBottom);

		checkbox.addEventListener("change", function () {
			if (V && V.options) {
				V.options.sidebarToBottom = checkbox.checked;
			}
		});

		label.appendChild(checkbox);
		label.appendChild(document.createTextNode(" Move sidebar to page / 将侧边栏移至页面"));

		var rec = document.createElement("div");
		rec.className = "mobile-rec gold";
		rec.textContent = "Recommended for mobile! 推荐手机端开启！";

		item.appendChild(label);
		item.appendChild(rec);
		settingsGrid.appendChild(item);
	}

	/* ── Core: split sidebar on every passage end ── */

	$(document).on(":passageend", function () {
		initOption();

		var enabled = V && V.options && V.options.sidebarToBottom;
		var inGame = V && V.intro === 0;

		/* ── Disabled or not in-game ── */
		if (!enabled || !inGame) {
			if (document.body.classList.contains(BODY_CLASS)) {
				var uiBarRestore = document.getElementById("ui-bar");
				if (uiBarRestore) uiBarRestore.classList.remove("stowed");
			}
			document.body.classList.remove(BODY_CLASS);
			return;
		}

		/* ── Enabled ── */
		document.body.classList.add(BODY_CLASS);

		var passage = document.querySelector("#passages .passage");
		if (!passage) return;

		var storyCaption = document.getElementById("story-caption");
		if (!storyCaption || !storyCaption.children.length) return;

		/* ── TOP: visuals (skybox + character image + stats overlay) ── */
		var topWrapper = document.createElement("div");
		topWrapper.id = TOP_ID;

		var skybox = storyCaption.querySelector("#canvasSkybox");
		var imgContainer = storyCaption.querySelector("#sidebar-img-container");

		if (skybox) topWrapper.appendChild(skybox);
		if (imgContainer) topWrapper.appendChild(imgContainer);

		/* Also grab the thermometer elements */
		var thermo = storyCaption.querySelector("#characterTemperature");
		var thermoTip = storyCaption.querySelector("#characterTemperatureTooltip");
		if (thermo) topWrapper.appendChild(thermo);
		if (thermoTip) topWrapper.appendChild(thermoTip);

		/* Grab #stats (money/time/date + stat indicators) → under portrait */
		var storyCaptionDiv = storyCaption.querySelector("#storyCaptionDiv");
		var stats = storyCaptionDiv ? storyCaptionDiv.querySelector("#stats") : null;
		if (stats) topWrapper.appendChild(stats);

		/* Insert top wrapper at the very beginning of passage */
		passage.insertBefore(topWrapper, passage.firstChild);

		/* Scale top wrapper to fit passage width */
		var passageWidth = passage.offsetWidth;
		if (passageWidth > 280) {
			var scale = passageWidth / 280;
			topWrapper.style.transformOrigin = "top left";
			topWrapper.style.transform = "scale(" + scale + ")";
			topWrapper.style.marginBottom = ((192 + 40) * (scale - 1)) + "px";
		}

		/* ── BOTTOM: everything else (stats, buttons, text) ── */
		var bottomSep = document.createElement("hr");
		bottomSep.className = "sidebar-bottom-separator";
		passage.appendChild(bottomSep);

		var bottomWrapper = document.createElement("div");
		bottomWrapper.id = BOTTOM_ID;
		passage.appendChild(bottomWrapper);

		/* Move remaining story-caption children */
		while (storyCaption.firstChild) {
			bottomWrapper.appendChild(storyCaption.firstChild);
		}

		/* Scale bottom wrapper to fit passage width */
		if (passageWidth > 280) {
			var scaleB = passageWidth / 280;
			bottomWrapper.style.transformOrigin = "top left";
			bottomWrapper.style.transform = "scale(" + scaleB + ")";
			/* Estimate bottom content height and add margin for scaled overflow */
			var bottomHeight = bottomWrapper.scrollHeight || 400;
			bottomWrapper.style.marginBottom = (bottomHeight * (scaleB - 1)) + "px";
		}

		/* Force-stow the real sidebar */
		var uiBar = document.getElementById("ui-bar");
		if (uiBar && !uiBar.classList.contains("stowed")) {
			uiBar.classList.add("stowed");
		}
	});
})();
