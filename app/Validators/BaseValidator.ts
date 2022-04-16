export default class BaseValidator {
	public messages = {
		minLength: "{{ field }} must be at least {{ options.minLength }} characters long",
    maxLength: "{{ field }} must be less then {{ options.maxLength }} characters long",
    required: "{{ field }} is required",
    email: "{{ field }} must be a valid email",
    notIn: "This value is not allowed for {{ field }}",
    unique: "{{ field }} must be unique, and this value is already taken"
	}
}