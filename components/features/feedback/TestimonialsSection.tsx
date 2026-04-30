import type { FeedbackReviewListItem } from "@/models/Feedback";

export function TestimonialsSection(props: {
  testimonials: FeedbackReviewListItem[];
}) {
  if (props.testimonials.length === 0) return null;

  return (
    <section className="pb-16">
      <h2 className="text-2xl font-semibold tracking-tight">
        What learners are saying
      </h2>
      <p className="mt-2 text-sm text-white">
        Recent platform feedback from users who rated Smart Study Platform 4+ stars.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {props.testimonials.map((item) => (
          <article key={item.id} className="launch-card p-5">
            <p className="text-amber-300">
              {"★".repeat(item.rating)}
              <span className="text-slate-500">{"★".repeat(5 - item.rating)}</span>
            </p>
            <p className="mt-2 text-sm text-white">{item.content}</p>
            <p className="mt-3 text-xs font-semibold text-white">{item.displayName}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
