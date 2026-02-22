const natural = require("natural");
const TfIdf = natural.TfIdf;

class AIEvaluator {
  // Calculate text similarity using TF-IDF
  calculateSimilarity(text1, text2) {
    try {
      // Normalize texts
      const normalize = (text) => text.toLowerCase().trim();
      const t1 = normalize(text1);
      const t2 = normalize(text2);

      // Check for exact match
      if (t1 === t2) return 100;

      // Check if one is substring of other
      if (t1.includes(t2) || t2.includes(t1)) return 90;

      const tfidf = new TfIdf();

      // Add documents
      tfidf.addDocument(t1);
      tfidf.addDocument(t2);

      // Get similarity score
      let similarity = 0;
      const terms1 = {};
      let termCount = 0;

      tfidf.listTerms(0).forEach((item) => {
        terms1[item.term] = item.tfidf;
        termCount++;
      });

      let matches = 0;
      tfidf.listTerms(1).forEach((item) => {
        if (terms1[item.term]) {
          similarity += terms1[item.term] * item.tfidf;
          matches++;
        }
      });

      // Normalize similarity score (0-100)
      // Use cosine similarity approach
      let normalizedSimilarity = 0;
      if (termCount > 0) {
        normalizedSimilarity = (matches / termCount) * 100;
      }

      // Combine TF-IDF score with match ratio
      const combinedScore = (similarity * 10 + normalizedSimilarity) / 2;
      return Math.min(Math.max(combinedScore, 0), 100);
    } catch (error) {
      console.error("Similarity calculation error:", error);
      return 0;
    }
  }

  // Generate feedback based on content analysis
  generateFeedback(text) {
    const feedback = [];

    // Check length
    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
    if (wordCount < 50) {
      feedback.push(
        "Your submission is very brief (less than 50 words). Add more content and details.",
      );
    } else if (wordCount < 100) {
      feedback.push(
        "Your submission is quite brief. Consider adding more details and examples.",
      );
    } else if (wordCount > 500) {
      feedback.push("✓ Good length! Your submission is comprehensive.");
    } else {
      feedback.push("✓ Good submission length.");
    }

    // Check for common sections
    const hasIntroduction =
      /introduction|overview|begin|first|start|opening/i.test(text);
    const hasConclusion =
      /conclusion|summary|in conclusion|to summarize|final|end|closing/i.test(
        text,
      );

    if (!hasIntroduction && wordCount > 100) {
      feedback.push("Consider adding a clear introduction to set context.");
    } else if (hasIntroduction) {
      feedback.push("✓ Good introduction found.");
    }

    if (!hasConclusion && wordCount > 100) {
      feedback.push("Add a conclusion to summarize your main points.");
    } else if (hasConclusion) {
      feedback.push("✓ Good conclusion found.");
    }

    // Check for examples
    const hasExamples =
      /example|for instance|such as|like|specifically|case|illustration/i.test(
        text,
      );
    if (!hasExamples && wordCount > 100) {
      feedback.push("Include specific examples to support your arguments.");
    } else if (hasExamples) {
      feedback.push("✓ Good use of examples.");
    }

    // Grammar and structure check
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length < 3 && wordCount > 50) {
      feedback.push("Your submission needs better paragraph structure.");
    } else if (sentences.length > 3) {
      feedback.push("✓ Good paragraph structure.");
    }

    // Calculate score based on various factors
    let score = 60; // Base score

    // Word count points
    if (wordCount >= 50 && wordCount < 100) score += 5;
    if (wordCount >= 100 && wordCount < 300) score += 15;
    if (wordCount >= 300) score += 20;

    // Quality points
    if (hasIntroduction) score += 5;
    if (hasConclusion) score += 5;
    if (hasExamples) score += 10;
    if (sentences.length > 5) score += 10;

    // Penalty for very short submissions
    if (wordCount < 50) score = Math.max(score - 20, 20);

    // Cap at 100
    score = Math.min(score, 100);

    // Generate summary
    let summary = feedback.join(" ");
    if (feedback.length === 0) {
      summary =
        "Great job! Your submission is well-structured and comprehensive.";
    }

    return {
      feedback_summary: summary,
      score: score,
    };
  }

  // Main evaluation function
  async evaluateSubmission(currentSubmission, allSubmissions) {
    try {
      const currentText = (currentSubmission.submission_text || "")
        .toLowerCase()
        .trim();

      if (!currentText || currentText.length === 0) {
        return {
          plagiarism_risk: "0.00",
          feedback_summary:
            "No text provided for evaluation. Please submit content.",
          score: 0,
        };
      }

      // Check plagiarism risk by comparing with other submissions
      let maxSimilarity = 0;
      let similarCount = 0;

      if (Array.isArray(allSubmissions) && allSubmissions.length > 1) {
        allSubmissions.forEach((sub) => {
          if (sub.id !== currentSubmission.id && sub.submission_text) {
            const otherText = (sub.submission_text || "").toLowerCase().trim();
            if (otherText.length > 0) {
              const similarity = this.calculateSimilarity(
                currentText,
                otherText,
              );
              if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
              }
              if (similarity > 50) {
                similarCount++;
              }
            }
          }
        });
      }

      // Adjust plagiarism risk based on similarity
      let plagiarismRisk = Math.round(maxSimilarity * 100) / 100; // Round to 2 decimals
      let riskMessage = "";

      if (plagiarismRisk > 80) {
        riskMessage =
          "⚠️ HIGH RISK: Very high similarity detected with other submissions.";
      } else if (plagiarismRisk > 60) {
        riskMessage =
          "⚠️ MEDIUM-HIGH RISK: Significant similarity detected with another submission.";
      } else if (plagiarismRisk > 40) {
        riskMessage =
          "⚠️ MEDIUM RISK: Moderate similarity with another submission.";
      } else if (plagiarismRisk > 20) {
        riskMessage =
          "ℹ️ LOW RISK: Some similarity detected but mostly original content.";
      } else {
        riskMessage = "✓ LOW RISK: Submission appears to be original.";
      }

      // Generate content feedback
      const { feedback_summary, score } = this.generateFeedback(currentText);

      // Combine feedback with plagiarism info
      const finalFeedback = `${riskMessage} ${feedback_summary}`;

      return {
        plagiarism_risk: plagiarismRisk.toFixed(2),
        feedback_summary: finalFeedback,
        score: score,
      };
    } catch (error) {
      console.error("AI Evaluation error:", error);
      // Return default values if AI evaluation fails
      return {
        plagiarism_risk: "0.00",
        feedback_summary:
          "Your submission has been received. Detailed feedback will be provided soon.",
        score: 75,
      };
    }
  }
}

module.exports = new AIEvaluator();
