const form = document.querySelector("#regForm");
const sections = Array.from(form.querySelectorAll(".step"));
const fields = Array.from(form.querySelectorAll("input, select, textarea"));
const summary = document.querySelector("#error-summary");
const status = document.querySelector("#projectStatus");
let currentStep = 0;

fields.forEach(function (field) {
  if (!field.id) field.id = "field-" + fields.indexOf(field);
  let error = document.getElementById(field.id + "_err");
  if (!error) {
    error = document.createElement("p");
    error.id = field.id + "_err";
    error.className = "field-error";
    field.insertAdjacentElement("afterend", error);
  }
  const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
  describedBy.add(error.id);
  field.setAttribute("aria-describedby", Array.from(describedBy).join(" "));
  error.setAttribute("aria-live", "polite");
});

function passwordChecks(value) {
  return {
    len: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    digit: /[0-9]/.test(value),
    symbol: /[^\p{L}\p{N}\s]/u.test(value),
  };
}

function customMessage(field) {
  const value = field.value;

  switch (field.id) {
    case "fullname":
      if (value && !/[A-Za-z]/.test(value)) {
        return "Enter a name with at least one letter.";
      }
      break;

    case "campusEmail":
      if (value && !field.validity.typeMismatch) {
        const domain = value.slice(value.lastIndexOf("@") + 1);
        if (domain.toLowerCase() !== "student.gsu.edu") {
          return "Use an email address ending in @student.gsu.edu.";
        }
      }
      break;

    case "password":
      if (value && !Object.values(passwordChecks(value)).every(Boolean)) {
        return "Use at least 8 characters, including an uppercase letter, a lowercase letter, a digit, and a symbol.";
      }
      break;

    case "confirm":
      if (value && value !== form.querySelector("#password").value) {
        return "Enter the same password in both fields.";
      }
      break;

    case "interests": {
      const count = field.selectedOptions.length;
      if (count < 1 || count > 3) {
        return "Choose between 1 and 3 interests.";
      }
      break;
    }

    case "bio":
      if (value.length > 140) {
        return "Keep your bio to 140 characters or fewer.";
      }
      break;
  }

  return "";
}

function checkField(field) {
  field.setCustomValidity("");
  field.setCustomValidity(customMessage(field));
  const valid = field.checkValidity();
  document.getElementById(field.id + "_err").textContent = valid ? "" : field.validationMessage;
  field.setAttribute("aria-invalid", String(!valid));
  return valid;
}

function showStep(index) {
  currentStep = index;
  sections.forEach(function (section, i) { section.classList.toggle("active", i === index); });
  document.querySelector("#stepNum").textContent = index + 1;
  summary.hidden = true;
  sections[index].querySelector("h2").focus();
}

function showErrors(invalid) {
  summary.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = "Please correct these fields";
  const list = document.createElement("ul");
  invalid.forEach(function (field) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#" + field.id;
    link.textContent = field.name + ": " + field.validationMessage;
    link.addEventListener("click", function (event) {
      event.preventDefault();
      showStep(sections.indexOf(field.closest(".step")));
      field.focus();
    });
    item.appendChild(link);
    list.appendChild(item);
  });
  summary.append(heading, list);
  summary.hidden = false;
  summary.focus();
}

function buildReview() {
  const review = document.querySelector("#reviewSummary");
  review.replaceChildren();

  const selectedTier = form.querySelector('input[name="tier"]:checked');
  const interests = Array.from(
    form.querySelector("#interests").selectedOptions,
    function (option) { return option.textContent; }
  );

  const groups = [
    {
      title: "Identity",
      rows: [
        ["Full name", form.querySelector("#fullname").value],
        ["Campus email", form.querySelector("#campusEmail").value],
        ["Student ID", form.querySelector("#studentId").value],
      ],
    },
    {
      title: "Security",
      rows: [["Practice password", "Password set"]],
    },
    {
      title: "Profile",
      rows: [
        ["Membership tier", selectedTier.closest("label").textContent.trim()],
        ["Interests", interests.join(", ")],
        ["Bio", form.querySelector("#bio").value || "None provided"],
        ["Terms", "Accepted"],
      ],
    },
  ];

  groups.forEach(function ({ title, rows }, index) {
    const heading = document.createElement("h3");
    heading.textContent = title;

    const details = document.createElement("dl");
    rows.forEach(function ([label, value]) {
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      description.textContent = value;
      details.append(term, description);
    });

    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "Edit " + title;
    edit.addEventListener("click", function () { showStep(index); });

    review.append(heading, details, edit);
  });
}

form.addEventListener("click", function (event) {
  if (event.target.closest("[data-back]")) showStep(Math.max(0, currentStep - 1));
  if (event.target.closest("[data-next]")) {
    const invalid = fields.filter(function (field) {
      return sections[currentStep].contains(field) && !checkField(field);
    });
    if (invalid.length) { showErrors(invalid); return; }
    if (currentStep === 2) buildReview();
    showStep(Math.min(3, currentStep + 1));
  }
});

fields.forEach(function (field) {
  field.addEventListener("blur", function () { checkField(field); });
  field.addEventListener("input", function () {
    status.textContent = "";
    if (field.getAttribute("aria-invalid") === "true") checkField(field);
        if (field.id === "password") {
      const confirmation = form.querySelector("#confirm");
      if (confirmation.value) checkField(confirmation);
    }
  });
});
document.querySelector("#bio").addEventListener("input", function (event) {
  document.querySelector("#bioCount").textContent = 140 - event.target.value.length;
});
const passwordField = form.querySelector("#password");
const passwordRuleItems = Array.from(
  form.querySelectorAll("#pwRules [data-rule]"),
  function (item) {
    return { item, label: item.textContent };
  }
);

function updatePasswordChecklist() {
  const checks = passwordChecks(passwordField.value);

  passwordRuleItems.forEach(function ({ item, label }) {
    const result = checks[item.dataset.rule] ? "Met" : "Needed";
    item.textContent = `${label} — ${result}`;
  });
}

passwordField.addEventListener("input", updatePasswordChecklist);
updatePasswordChecklist();

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const invalid = fields.filter(function (field) { return !checkField(field); });
  if (invalid.length) { showErrors(invalid); return; }
  buildReview();
  showStep(3);
  status.textContent = "Implemented checks passed. Nothing sent. Complete all TODOs before submitting this project.";
});
showStep(0);