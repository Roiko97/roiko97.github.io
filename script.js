(function () {
    const data = window.homepageData;

    if (!data) {
        return;
    }

    const state = {
        search: "",
        year: "All",
    };

    const $ = (selector) => document.querySelector(selector);

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        if (text !== undefined) {
            node.textContent = text;
        }
        return node;
    }

    function link(label, href, className) {
        const anchor = element("a", className || "link-button", label);
        anchor.href = href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        return anchor;
    }

    function textWithHighlights(text) {
        const fragment = document.createDocumentFragment();
        const names = data.focusNames || [];

        if (!names.length) {
            fragment.append(document.createTextNode(text));
            return fragment;
        }

        const escaped = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        const pattern = new RegExp(`(${escaped.join("|")})`, "g");
        const pieces = text.split(pattern).filter(Boolean);

        pieces.forEach((piece) => {
            if (names.includes(piece)) {
                const strong = element("strong", "", piece);
                fragment.append(strong);
            } else {
                fragment.append(document.createTextNode(piece));
            }
        });

        return fragment;
    }

    function cleanSentence(text) {
        const trimmed = text.trim();
        return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
    }

    function renderProfile() {
        document.title = `${data.profile.name} | Homepage`;
        $("#profile-photo").src = data.profile.photo;
        $("#profile-photo").alt = data.profile.name;
        $("#profile-name").textContent = data.profile.name;
        $("#profile-title").textContent = data.profile.title;
        $("#profile-affiliation").textContent = data.profile.affiliation;

        const meta = $("#profile-meta");
        meta.replaceChildren();
        data.profile.meta.forEach((item) => {
            const row = element("div");
            row.append(element("dt", "", item.label), element("dd", "", item.value));
            meta.append(row);
        });

        const links = $("#profile-links");
        links.replaceChildren();
        data.profile.links.forEach((item) => links.append(link(item.label, item.href)));

        const quote = $("#maple-quote");
        if (quote) {
            quote.textContent = data.mapleQuote || "";
        }
    }

    function renderAbout() {
        const about = $("#about-content");
        about.replaceChildren();
        data.about.forEach((paragraph) => {
            about.append(element("p", "", paragraph));
        });
    }

    function appendPublicationLinks(publication, target) {
        if (!publication.links || !publication.links.length) {
            return;
        }

        publication.links
            .filter((item) => item.href)
            .forEach((item) => {
                target.append(document.createTextNode(" "));
                target.append(link(item.label, item.href, "publication-link"));
            });
    }

    function appendBadges(publication, target) {
        if (!publication.badges || !publication.badges.length) {
            return;
        }

        publication.badges.forEach((badge) => {
            target.append(document.createTextNode(" "));
            target.append(element("span", "badge", badge));
        });
    }

    function publicationItem(publication) {
        const item = element("li", "publication-item");
        const entry = element("p", "publication-entry");
        const title = element("strong", "publication-title");
        const authors = element("span", "publication-authors");
        const venue = element("span", "publication-venue", cleanSentence(publication.venue));

        if (publication.titleLink) {
            title.append(link(publication.title, publication.titleLink, ""));
        } else {
            title.textContent = publication.title;
        }

        authors.append(textWithHighlights(publication.authors));
        entry.append(title);
        entry.append(document.createTextNode(". "));
        entry.append(authors);
        entry.append(document.createTextNode(". "));
        entry.append(venue);
        appendPublicationLinks(publication, entry);
        appendBadges(publication, entry);
        item.append(entry);
        return item;
    }

    function groupedPublications() {
        return data.publications.reduce((groups, publication) => {
            if (!groups[publication.year]) {
                groups[publication.year] = [];
            }
            groups[publication.year].push(publication);
            return groups;
        }, {});
    }

    function matchesPublication(publication) {
        const search = state.search.trim().toLowerCase();
        const inYear = state.year === "All" || String(publication.year) === state.year;

        if (!search) {
            return inYear;
        }

        const haystack = [
            publication.year,
            publication.type,
            publication.title,
            publication.authors,
            publication.venue,
            (publication.badges || []).join(" "),
        ].join(" ").toLowerCase();

        return inYear && haystack.includes(search);
    }

    function renderYearFilter() {
        const years = ["All", ...Object.keys(groupedPublications()).sort((a, b) => Number(b) - Number(a))];
        const filter = $("#year-filter");
        filter.replaceChildren();

        years.forEach((year) => {
            const button = element("button", "year-button", year);
            button.type = "button";
            button.classList.toggle("active", year === state.year);
            button.addEventListener("click", () => {
                state.year = year;
                renderPublications();
                renderYearFilter();
            });
            filter.append(button);
        });
    }

    function renderPublications() {
        const container = $("#publication-years");
        const groups = groupedPublications();
        let rendered = 0;

        container.replaceChildren();

        Object.keys(groups)
            .sort((a, b) => Number(b) - Number(a))
            .forEach((year) => {
                const matches = groups[year].filter(matchesPublication);
                if (!matches.length) {
                    return;
                }

                const section = element("section", "year-section");
                const list = element("ol", "publication-list");
                list.start = rendered + 1;
                matches.forEach((publication) => list.append(publicationItem(publication)));
                rendered += matches.length;

                section.append(element("h3", "", year), list);
                container.append(section);
            });

        if (!rendered) {
            container.append(element("p", "empty-state", "No publications match the current filter."));
        }
    }

    function renderHonors() {
        const list = $("#honor-list");
        list.replaceChildren();
        data.honors.forEach((honor) => {
            const item = element("li");
            item.append(element("time", "", honor.date), document.createTextNode(honor.text));
            list.append(item);
        });
    }

    function renderProjects() {
        const list = $("#project-list");
        list.replaceChildren();

        if (!data.projects || !data.projects.length) {
            list.append(element("p", "empty-state", "Project records will be updated soon."));
            return;
        }

        data.projects.forEach((project) => {
            const card = element("article", "project-card");
            const title = element("h3", "", project.title);
            const meta = element("p", "project-meta");
            const metaParts = [project.role, project.agency, project.period, project.status].filter(Boolean);

            if (metaParts.length) {
                meta.textContent = metaParts.join(" · ");
            }

            card.append(title);
            if (metaParts.length) {
                card.append(meta);
            }
            if (project.description) {
                card.append(element("p", "project-description", project.description));
            }
            list.append(card);
        });
    }

    function renderService() {
        const list = $("#service-list");
        list.replaceChildren();
        data.service.forEach((service) => {
            const card = element("article", "service-card");
            card.append(element("h3", "", service.title), element("p", "", service.items.join(", ")));
            list.append(card);
        });
    }

    function bindSearch() {
        const input = $("#publication-search");
        input.addEventListener("input", (event) => {
            state.search = event.target.value;
            renderPublications();
        });
    }

    function bindTabs() {
        const buttons = Array.from(document.querySelectorAll(".tab-button"));
        const panels = {
            honors: $("#honors-panel"),
            projects: $("#projects-panel"),
        };

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const activeTab = button.dataset.tab;
                buttons.forEach((item) => {
                    const isActive = item === button;
                    item.classList.toggle("active", isActive);
                    item.setAttribute("aria-selected", String(isActive));
                });

                Object.entries(panels).forEach(([name, panel]) => {
                    const isActive = name === activeTab;
                    panel.classList.toggle("active", isActive);
                    panel.hidden = !isActive;
                });
            });
        });
    }

    function renderFooter() {
        const year = new Date().getFullYear();
        $("#footer-text").textContent = `(c) ${year} ${data.profile.name}. Last updated from homepage-data.js.`;
    }

    renderProfile();
    renderAbout();
    renderYearFilter();
    renderPublications();
    renderHonors();
    renderProjects();
    renderService();
    renderFooter();
    bindSearch();
    bindTabs();
})();
