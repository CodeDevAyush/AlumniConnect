"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Sparkles,
  Share2,
  Heart,
  PlusCircle,
  Tag,
  Building,
  UserCheck,
  Send,
  Filter,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getAnnouncements,
  createCommunityPost,
  likeCommunityPost,
  getCurrentUser,
} from "@/services/api-client";
import { CommunityCategory, CommunityPost } from "@/types";

const CATEGORY_LABELS: Record<CommunityCategory, { label: string; color: string }> = {
  MENTOR_UPDATE: { label: "Mentor Advice", color: "bg-blue-100 text-blue-800 border-blue-200" },
  TECH_INSIGHT: { label: "Technical Insight", color: "bg-purple-100 text-purple-800 border-purple-200" },
  REFERRAL: { label: "Hiring & Referrals", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  STUDENT_UPDATE: { label: "Student Project & Question", color: "bg-teal-100 text-teal-800 border-teal-200" },
  EVENT: { label: "Campus Event", color: "bg-amber-100 text-amber-800 border-amber-200" },
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const currentUser = getCurrentUser();
  const isAlumni = currentUser?.role === "ALUMNI";

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<CommunityCategory>(
    isAlumni ? "MENTOR_UPDATE" : "STUDENT_UPDATE",
  );
  const [authorRole, setAuthorRole] = useState(
    isAlumni ? "Alumni Mentor" : "Student Candidate",
  );
  const [authorCompany, setAuthorCompany] = useState(
    isAlumni ? "" : "Campus Student",
  );
  const [tagsInput, setTagsInput] = useState("Engineering, Mentorship");
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setPosts(data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(postId: string) {
    if (likedPosts[postId]) return;
    try {
      await likeCommunityPost(postId);
      setLikedPosts((prev) => ({ ...prev, [postId]: true }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likesCount: post.likesCount + 1 } : post,
        ),
      );
    } catch {
      // Ignore
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError("Title and post content are required.");
      return;
    }

    setCreating(true);
    setFormError("");
    setFormSuccess("");

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const authorName = currentUser?.profile?.firstName
        ? `${currentUser.profile.firstName} ${currentUser.profile.lastName || ""}`.trim()
        : currentUser?.email?.split("@")[0] || (isAlumni ? "Alumni Mentor" : "Candidate Student");

      const resolvedRole = isAlumni
        ? currentUser?.profile?.title || authorRole || "Alumni Mentor"
        : authorRole || "Student Candidate";

      const resolvedCompany = isAlumni
        ? currentUser?.profile?.company || authorCompany || "Alumni Network"
        : authorCompany || currentUser?.profile?.department || "Campus Student";

      const newPost = await createCommunityPost({
        title,
        content,
        category,
        authorName,
        authorRole: resolvedRole,
        authorCompany: resolvedCompany,
        tags,
        userRole: currentUser?.role,
      });

      setPosts((prev) => [newPost, ...prev]);
      setTitle("");
      setContent("");
      setFormSuccess("Update published successfully!");
      setShowCreateForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to publish post.");
    } finally {
      setCreating(false);
    }
  }

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "ALL" || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Mentorship & Community Updates</h1>
            <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 font-semibold">
              Live Feed
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Verified alumni engineering guidance, referral announcements, and student project updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              if (!showCreateForm) {
                setCategory(isAlumni ? "MENTOR_UPDATE" : "STUDENT_UPDATE");
                setAuthorRole(isAlumni ? "Alumni Mentor" : "Student Candidate");
              }
              setShowCreateForm(!showCreateForm);
            }}
            className={`gap-2 text-white ${
              isAlumni ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            {showCreateForm
              ? "Close Form"
              : isAlumni
              ? "Share Mentor Update"
              : "Share Student Update"}
          </Button>
          {!isAlumni && (
            <Link href="/discovery">
              <Button variant="outline" className="gap-1.5">
                <span>Find Mentors</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Top Engineering Mentors</p>
              <p className="text-sm font-bold text-slate-800">Google, Stripe, Meta & Netflix</p>
              <p className="text-xs text-slate-500">Graduates sharing playbooks and advice</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Direct Referrals</p>
              <p className="text-sm font-bold text-slate-800">80+ Assessment Rating Access</p>
              <p className="text-xs text-slate-500">Score 80+ to request mentorship slots</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50/50 border-purple-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-900 uppercase tracking-wider">Community Questions</p>
              <p className="text-sm font-bold text-slate-800">Students & Mentors Connected</p>
              <p className="text-xs text-slate-500">Students can add updates and see alumni advice</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Update Form (Accessible to Both) */}
      {showCreateForm && (
        <Card className="border-blue-300 shadow-md bg-white">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              <Share2 className="h-5 w-5 text-blue-600" />
              {isAlumni ? "Share a Mentor Update or Referral" : "Share a Student Update or Question"}
            </CardTitle>
            <CardDescription>
              {isAlumni
                ? "Post mentorship guidance, system design insights, or company hiring alerts for students."
                : "Post your project progress, hackathon achievement, or ask a question to alumni mentors."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreatePost}>
            <CardContent className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-sm rounded bg-red-50 text-red-700 border border-red-200">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 text-sm rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {formSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Post Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CommunityCategory)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    {isAlumni ? (
                      <>
                        <option value="MENTOR_UPDATE">Mentor Advice & Guidance</option>
                        <option value="TECH_INSIGHT">Technical Deep Dive / Code Quality</option>
                        <option value="REFERRAL">Hiring Opportunity & Referrals</option>
                        <option value="EVENT">Campus Tech Talk / Event</option>
                      </>
                    ) : (
                      <>
                        <option value="STUDENT_UPDATE">Student Project / Learning Update</option>
                        <option value="MENTOR_UPDATE">Mentorship Guidance Question</option>
                        <option value="EVENT">Hackathon / Campus Study Group</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {isAlumni ? "Company / Organization" : "University Major / Department"}
                  </label>
                  <Input
                    placeholder={isAlumni ? "e.g. Google, Stripe, Meta" : "e.g. Computer Science, AI"}
                    value={authorCompany}
                    onChange={(e) => setAuthorCompany(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Your Title / Role Tag
                  </label>
                  <Input
                    placeholder={isAlumni ? "e.g. Senior Staff Engineer" : "e.g. 3rd Year CS Student, Candidate"}
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Tags (comma separated)
                  </label>
                  <Input
                    placeholder="e.g. System Design, Code Quality, Machine Learning"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Update Title
                </label>
                <Input
                  placeholder={
                    isAlumni
                      ? "e.g. Key takeaways from reviewing 50+ junior GitHub repositories this quarter"
                      : "e.g. Built an end-to-end distributed cache project — looking for mentor feedback"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Post Content
                </label>
                <Textarea
                  placeholder={
                    isAlumni
                      ? "Share engineering advice, what makes candidate code stand out, interview preparations..."
                      : "Describe your project, code quality score, learning progress, or questions for alumni..."
                  }
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3 px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className={`gap-2 text-white ${
                  isAlumni ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Send className="h-4 w-4" />
                {creating ? "Publishing..." : "Publish Update"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCategory === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("ALL")}
            className="rounded-full text-xs"
          >
            All Updates ({posts.length})
          </Button>
          {(Object.keys(CATEGORY_LABELS) as CommunityCategory[]).map((cat) => {
            const count = posts.filter((p) => p.category === cat).length;
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full text-xs"
              >
                {CATEGORY_LABELS[cat].label} ({count})
              </Button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <Input
            placeholder="Search updates, topics, or mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm pl-9"
          />
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-sm text-slate-500">Loading mentorship updates...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <MessageSquare className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800">No updates found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "No updates match your search keywords."
              : "Be the first to share an update with the campus community!"}
          </p>
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
            className="mt-4 gap-1.5 bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            Share First Update
          </Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {filteredPosts.map((post) => {
            const categoryMeta = CATEGORY_LABELS[post.category] || {
              label: "Update",
              color: "bg-slate-100 text-slate-800 border-slate-200",
            };
            const isLiked = likedPosts[post.id];
            const isMentorPost = post.category === "MENTOR_UPDATE" || post.category === "TECH_INSIGHT" || post.category === "REFERRAL";

            return (
              <Card
                key={post.id}
                className={`transition-all shadow-sm ${
                  isMentorPost
                    ? "border-slate-200 hover:border-purple-300"
                    : "border-teal-200 bg-teal-50/10 hover:border-teal-400"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm ${
                          isMentorPost
                            ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                            : "bg-gradient-to-tr from-teal-600 to-blue-600"
                        }`}
                      >
                        {post.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 text-base">{post.authorName}</span>
                          {isMentorPost ? (
                            <span title="Verified Alumni Mentor">
                              <CheckCircle2 className="h-4 w-4 text-purple-600" />
                            </span>
                          ) : (
                            <span title="Student Candidate">
                              <GraduationCap className="h-4 w-4 text-teal-600" />
                            </span>
                          )}
                          {post.authorCompany && (
                            <Badge variant="outline" className="text-[11px] font-medium border-slate-300 text-slate-700 ml-1">
                              {isMentorPost ? (
                                <Building className="h-3 w-3 mr-1 inline" />
                              ) : (
                                <GraduationCap className="h-3 w-3 mr-1 inline" />
                              )}
                              {post.authorCompany}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{post.authorRole}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-semibold ${categoryMeta.color}`}>
                        {categoryMeta.label}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {new Date(post.publishedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          <Tag className="h-3 w-3 text-slate-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`gap-1.5 text-xs ${
                        isLiked ? "text-pink-600 bg-pink-50" : "text-slate-600 hover:text-pink-600"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-pink-600 text-pink-600" : ""}`} />
                      <span>{post.likesCount} Helpful</span>
                    </Button>
                  </div>

                  <Link href="/discovery">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs hover:border-blue-400">
                      <span>Connect with Mentors</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
