import logger from "./utils/logger";

const { LFMKEY, BASEURL } = process.env;

async function getUser(username: string, duration: string) {
	const endpoint = `${BASEURL}&user=${username}&period=${duration}&api_key=${LFMKEY}&format=json`;
	logger.debug(
		`attempting to fetch last.fm api data for user: ${username} - duration: ${duration}`,
	);
	const response = await fetch(endpoint, {
		signal: AbortSignal.timeout(10000),
	});

	if (!response.ok) {
		if (response.status === 404) {
			logger.debug(`getUser for ${username} returned a 404`);
			return null;
		}
		throw new Error(`HTTP error: status ${response.status}`);
	}

	const data: Fmdata = await response.json();
	const albums = data.topalbums.album;
	const user: User = { username: username, albums: [], b64: undefined };
	user.albums = albums
		.map((album) => {
			return {
				artist: album.artist.name,
				title: album.name,
				image:
					album.image.filter((image) => image.size === "extralarge")[0]?.[
						"#text"
					] ?? "",
			};
		})
		.slice(0, 16);
	return user;
}

export default getUser;
