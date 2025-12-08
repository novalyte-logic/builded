/**
 * Workforce Exchange AI Matching Engine
 * 
 * Uses Gemini/Vertex AI to score and match practitioners to clinic requests
 */

import 'server-only'

import { callGemini } from '@/lib/vertex-ai/service'
import type {
  WorkforceRequest,
  PractitionerProfile,
  WorkforceMatch,
} from '@/lib/types/workforce'

interface MatchInput {
  request: WorkforceRequest
  practitioners: PractitionerProfile[]
}

/**
 * AI-powered matching engine using Gemini
 * Scores practitioners based on skills, location, availability, and rating
 */
export async function generateWorkforceMatches({
  request,
  practitioners,
}: MatchInput): Promise<WorkforceMatch[]> {
  // Filter practitioners by basic criteria first
  let candidates = practitioners.filter((p) => {
    // Must match role
    if (p.role !== request.role) return false

    // Must have required skills
    const hasSkills = request.skills.every((skill) =>
      p.specialties.some((s) => s.skill === skill)
    )
    if (!hasSkills) return false

    // Must be available during requested dates
    const requestStart = new Date(request.startDate)
    const requestEnd = new Date(request.endDate)
    if (
      p.availability.endDate &&
      new Date(p.availability.endDate) < requestStart
    ) {
      return false
    }
    if (new Date(p.availability.startDate) > requestEnd) {
      return false
    }

    // Must pass background check
    if (p.backgroundCheckStatus !== 'Verified') return false

    return true
  })

  // Use Gemini AI to score and rank matches
  const matchPrompt = `
You are matching healthcare practitioners to clinic staffing requests.

CLINIC REQUEST:
- Role: ${request.role}
- Required Skills: ${request.skills.join(', ')}
- Coverage Type: ${request.coverageType}
- Location: ${request.clinicLocation.city}, ${request.clinicLocation.state}
- Dates: ${request.startDate} to ${request.endDate}
- Hours: ${request.hoursNeeded}

CANDIDATE PRACTITIONERS:
${candidates
  .map(
    (p, idx) => `
${idx + 1}. ${p.firstName} ${p.lastName} (${p.role})
   - Skills: ${p.specialties.map((s) => s.skill).join(', ')}
   - Location: ${p.location.city}, ${p.location.state}
   - Rating: ${p.rating}/5.0 (${p.reviewCount} reviews)
   - Rate: $${p.hourlyRate}/hr
   - Available: ${p.availability.startDate} to ${p.availability.endDate || 'Ongoing'}
`
  )
  .join('\n')}

For each candidate, calculate a match score (0-100) based on:
1. Skills compatibility (0-30 points)
2. Location proximity (0-25 points) 
3. Availability match (0-25 points)
4. Rating/reputation (0-20 points)

Return a JSON array of top 5 matches with:
- practitioner_index: The index (1-based) of the practitioner
- match_score: 0-100 overall score
- skills_score: 0-30
- location_score: 0-25
- availability_score: 0-25
- rating_score: 0-20
- explanation: Brief explanation of why this match was chosen (2-3 sentences)

Return ONLY valid JSON, no markdown or extra text.
`

  try {
    const aiResponse = await callGemini(matchPrompt)
    
    // Parse AI response (placeholder - would parse actual JSON from Gemini)
    // For now, use heuristic scoring
    const matches = scoreMatchesHeuristic(candidates, request).slice(0, 5)

    return matches.map((match, idx) => ({
      id: `match-${request.id}-${idx}`,
      requestId: request.id,
      practitionerId: match.practitioner.id,
      matchScore: match.score,
      explanation: match.explanation,
      compatibilityFactors: match.factors,
      estimatedCost: calculateEstimatedCost(match.practitioner, request),
      createdAt: new Date(),
    }))
  } catch (error) {
    console.error('AI matching error, falling back to heuristic:', error)
    // Fallback to heuristic matching
    return scoreMatchesHeuristic(candidates, request)
      .slice(0, 5)
      .map((match, idx) => ({
        id: `match-${request.id}-${idx}`,
        requestId: request.id,
        practitionerId: match.practitioner.id,
        matchScore: match.score,
        explanation: match.explanation,
        compatibilityFactors: match.factors,
        estimatedCost: calculateEstimatedCost(match.practitioner, request),
        createdAt: new Date(),
      }))
  }
}

function scoreMatchesHeuristic(
  practitioners: PractitionerProfile[],
  request: WorkforceRequest
): Array<{
  practitioner: PractitionerProfile
  score: number
  factors: {
    skills: number
    location: number
    availability: number
    rating: number
  }
  explanation: string
}> {
  return practitioners
    .map((practitioner) => {
      // Skills score (0-30)
      const skillsMatch = request.skills.filter((skill) =>
        practitioner.specialties.some((s) => s.skill === skill)
      )
      const skillsScore = (skillsMatch.length / request.skills.length) * 30

      // Location score (0-25) - simplified, would use actual distance
      const sameState = practitioner.location.state === request.clinicLocation.state
      const sameCity = practitioner.location.city === request.clinicLocation.city
      const locationScore = sameCity ? 25 : sameState ? 15 : 10

      // Availability score (0-25) - simplified
      const availabilityScore = 20 // Would calculate based on actual availability

      // Rating score (0-20)
      const ratingScore = (practitioner.rating / 5) * 20

      const totalScore = skillsScore + locationScore + availabilityScore + ratingScore

      const explanation = `${practitioner.firstName} ${practitioner.lastName} is a strong match with ${skillsMatch.length} of ${request.skills.length} required skills, located in ${practitioner.location.city}, ${practitioner.location.state}, and has a ${practitioner.rating}/5.0 rating from ${practitioner.reviewCount} reviews.`

      return {
        practitioner,
        score: Math.round(totalScore),
        factors: {
          skills: Math.round(skillsScore),
          location: Math.round(locationScore),
          availability: Math.round(availabilityScore),
          rating: Math.round(ratingScore),
        },
        explanation,
      }
    })
    .sort((a, b) => b.score - a.score)
}

function calculateEstimatedCost(
  practitioner: PractitionerProfile,
  request: WorkforceRequest
): number {
  const hourlyRate = practitioner.hourlyRate
  const totalHours = request.hoursNeeded
  return hourlyRate * totalHours
}

