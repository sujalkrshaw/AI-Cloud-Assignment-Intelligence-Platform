import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOPWORDS={"the","a","an","and","or","to","of","in","on","for","is","are","was","were","with","by","this","that","from","as","at","be","it","we","can","which","their","has","have","using","into","also","than"}

def tokens(text):
    return [w for w in re.findall(r"[a-zA-Z][a-zA-Z0-9_-]{2,}", text.lower()) if w not in STOPWORDS]

def keyword_score(text, assignment_text):
    a=set(tokens(assignment_text)); b=set(tokens(text))
    return round(100*len(a & b)/len(a),2) if a else 0.0

def similarity(text_a,text_b):
    if not text_a.strip() or not text_b.strip(): return 0.0
    vec=TfidfVectorizer(stop_words="english",ngram_range=(1,2),max_features=5000)
    matrix=vec.fit_transform([text_a,text_b])
    return round(float(cosine_similarity(matrix[0:1],matrix[1:2])[0][0]*100),2)

def rubric_matrix(text, description, rubric, max_marks):
    criteria=[]
    for part in rubric.split(";"):
        if ":" in part:
            name,weight=part.split(":",1); m=re.search(r"(\d+(?:\.\d+)?)",weight)
            if m: criteria.append((name.strip(),float(m.group(1))))
    if not criteria: criteria=[("Technical accuracy",40), ("Completeness",30), ("Clarity",30)]
    base=keyword_score(text,description)/100
    wc=min(1.0,len(tokens(text))/300)
    out=[]
    for name,weight in criteria:
        factor=0.7*base+0.3*wc
        if "clar" in name.lower(): factor=0.5*base+0.5*wc
        score=round(weight*min(1.0,factor),2)
        out.append({"criterion":name,"weight":weight,"score":score,"max":weight})
    return out

def suggested_grade(text, assignment_description, rubric, max_marks):
    words=tokens(text); wc=len(words); rel=keyword_score(text,assignment_description)
    completeness=min(100.0,wc/3.0); quality=0.55*rel+0.45*completeness
    marks=round(max_marks*quality/100,1)
    missing=[term for term in tokens(assignment_description)[:12] if term not in set(words)]
    feedback=f"The submission contains {wc} meaningful words and matches approximately {rel:.1f}% of the assignment vocabulary. AI-assisted score suggestion: {marks}/{max_marks}. "
    feedback += ("Consider covering these assignment terms more explicitly: "+", ".join(dict.fromkeys(missing[:6]))+"." if missing else "The submission addresses the main vocabulary identified in the assignment description.")
    return marks,rel,feedback,rubric_matrix(text,assignment_description,rubric,max_marks)
