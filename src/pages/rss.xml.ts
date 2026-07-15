import { siteConfig } from "@/site-config";
import { getPostUrl, getSortedPosts } from "@/data/post";
import rss from "@astrojs/rss";

export const GET = async () => {
	const posts = await getSortedPosts();

	return rss({
		description: siteConfig.description,
		items: posts.map((post) => ({
			description: post.data.description,
			link: getPostUrl(post),
			pubDate: post.data.publishDate,
			title: post.data.title,
		})),
		site: import.meta.env.SITE,
		title: siteConfig.title,
	});
};
