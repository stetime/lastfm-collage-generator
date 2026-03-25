const form = document.querySelector<HTMLFormElement>("#collage");
const button = document.querySelector<HTMLButtonElement>("#submit");

form!.addEventListener("submit", async (event) => {
	event.preventDefault();
	if (!event.target) return;
	const username = (event.target as HTMLFormElement).username.value.trim();
	const duration = (event.target as HTMLFormElement).duration.value;
	if (!username) {
		showErrorMessage("Please enter a username");
		return;
	}

	clearError();
	setLoading(true);

	try {
		const response = await fetch(`/api/${username}/${duration}`);

		if (response.status === 404) {
			showErrorMessage(`No user found: ${username}`);
			return;
		}
		if (!response.ok) {
			showErrorMessage(`Error: ${response.status}`);
			return;
		}
		const data = await response.json();
		if (!data.b64) {
			showErrorMessage(
				`No listening data for ${username} for that time period`,
			);
			return;
		}
		const blob = await fetch(`data:image/jpeg;base64,${data.b64}`).then((r) =>
			r.blob(),
		);
		window.location.href = URL.createObjectURL(blob);
	} catch (err) {
		showErrorMessage("Something went wrong, please try again");
		console.error(err);
	} finally {
		setLoading(false);
	}
});

function setLoading(loading: boolean) {
	if (!button) return;
	button.disabled = loading;
	button.textContent = loading ? "Generating..." : "Generate";
}

function clearError() {
	const existing = document.querySelector(".error_text");
	existing?.remove();
}

function showErrorMessage(message: string) {
	clearError();
	const footer = document.querySelector("#footer");
	const error = document.createElement("p");
	error.textContent = message;
	error.classList.add("error_text");
	footer!.appendChild(error);
	setTimeout(() => error.remove(), 5000);
}
