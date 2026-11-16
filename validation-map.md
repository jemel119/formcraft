# CampusConnect Validation Map

All fields are checked on blur and on Next within their step. Review and final submission check every field. Fields flagged as invalid are rechecked on input.

| Step | Field | Rule | Enforcement | Additional live feedback |
|---|---|---|---|---|
| Identity | Full name | Required. Allows ASCII letters, ordinary spaces, hyphens, and apostrophes. At least one letter is required. | HTML `required` and `pattern`; JS requires a letter. | Inline error when invalid. |
| Identity | Campus email | Required email address with the exact domain `student.gsu.edu`, compared case-insensitively. | HTML `required` and `type="email"`; JS checks the domain. | Inline error when invalid. |
| Identity | Fictional student ID | Exactly nine digits, with the first digit from 1 to 9. | HTML `required` and `pattern`. | Inline error when invalid. |
| Security | Practice password | Required. At least eight characters, with uppercase and lowercase ASCII letters, a digit, and a symbol. | HTML `required` and `minlength`; JS checks length and composition. | Checklist updates on password input. |
| Security | Confirm password | Required. Must match the practice password exactly, including spaces. | HTML `required`; JS compares both values. | Rechecked when the original password changes after confirmation was entered. |
| Profile | Membership tier | Select one tier. Standard is selected initially. | HTML radio group and `required`. | Review displays the selected tier and price. |
| Profile | Interests | Select one to three interests. | HTML `required` and `multiple`; JS checks the selection count. | Inline error when invalid. |
| Profile | Bio | Optional, up to 140 characters. | HTML `maxlength`; JS also checks values assigned programmatically. | Remaining-character count updates on input. |
| Profile | Terms | Must be accepted. | HTML `required` checkbox. | Inline error when unchecked during validation. |