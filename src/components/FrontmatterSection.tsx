import { FrontmatterOptions } from "$src/types";
import TopicPill from "$components/TopicPill";

export default function FrontmatterSection({
    frontmatter,
  }: {
    frontmatter: FrontmatterOptions;
  }) {
    return (
      <span className="flex flex-row items-baseline justify-between mx-auto bg-neutral-200 py-3 px-4 rounded-lg">
        {/* LEFT SECTION */}
        <div className="flex flex-col gap-2">
          {/* TOP LECTURE SECTION */}
          <span className="flex flex-row items-baseline gap-2">
            {frontmatter.lecture?.title ? (
              <span className="flex flex-row gap-2 items-baseline">
                <h2 className="text-lg font-sourcecodepro text-neutral-600">
                  Lecture{" "}
                </h2>
                <h2 className="text-2xl font-sourcecodepro font-semibold">
                  {frontmatter.lecture.title}
                </h2>
              </span>
            ) : (
              <h2 className="text-2xl font-sourcecodepro font-semibold">
                Unnamed lecture
              </h2>
            )}
            {(frontmatter.lecture?.date || frontmatter.lecture?.professor) && (
              <h3 className="text-lg font-sourcecodepro text-neutral-600">
                held
                {frontmatter.lecture?.date && ` on ${frontmatter.lecture.date}`}
                {frontmatter.lecture?.professor &&
                  ` by ${frontmatter.lecture.professor}`}
              </h3>
            )}
          </span>
  
          {/* BOTTOM LECTURE SECTION (TOPICS) */}
          {frontmatter.lecture?.topics && frontmatter.lecture?.topics.length > 0 && (
            <div className="flex flex-row gap-4 items-center">
              <h4 className="text-lg font-sourcecodepro text-neutral-600">
                Topics:
              </h4>
              <div className="flex flex-row gap-2">
                {frontmatter.lecture.topics.map((topic, idx) => (
                  <TopicPill key={`topic-${idx}`} topic={topic} />
                ))}
              </div>
            </div>
          )}
        </div>
        {/* RIGHT SECTION */}
        {frontmatter.lastUpdated && (
          <h3 className="text-lg font-sourcecodepro text-neutral-900 font-semibold">
            Notes last updated on {frontmatter.lastUpdated}
          </h3>
        )}
      </span>
    );
  }