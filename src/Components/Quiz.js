import  React from 'react';

import { SEO } from './seo';

import { loadQuiz } from '../dataLoader'

import Images from './images';

function shuffleArray(array) {
    const offset = 0.5;
    array.sort(() => Math.random() - offset);
    return array;
}


class Quiz extends React.Component {

    constructor(props) {
        super(props);
        const questionSets = loadQuiz(props.name);
        const quizData = [...shuffleArray(questionSets.setA),
            ...shuffleArray(questionSets.setB)];
        const setAQuestionCount = questionSets.setA.length;
        const setBQuestionCount = questionSets.setB.length;
        const totalQuestions = setAQuestionCount + setBQuestionCount;
        const totalScore = (1 * setAQuestionCount) + (2 * setBQuestionCount);
        const quesPerPage = 20;
        const answerMap = Array.from({totalQuestions}, (_, i) => 
            `${i+1}`).reduce((acc, key) => ({ ...acc, [key]: null }), {});
        this.quizData = quizData;
        this.totalPages = (totalQuestions / quesPerPage);
        this.quesPerPage = quesPerPage;
        this.sAQCount = setAQuestionCount;
        this.sBQCount = setBQuestionCount;
        this.totalQuestions = totalQuestions;
        this.totalScore = totalScore;
        this.passMark = (0.5 * totalScore);
        this.state = {
            currentPage: 1,
            start: 0,
            end: this.quesPerPage,
            selOpts: answerMap,
            explainedQuestions: answerMap,
            totalAnswered: 0,
            submitted: false,
            score: 0,
        }
    }

    componentDidMount() {
        window.MathJax.typeset();
    }; 

    componentDidUpdate() {
        window.MathJax.typeset();
    }; 

    renderQues = (question, questionNumber) => {

        const { currentPage, submitted, selOpts, explainedQuestions } = this.state;
        const questionKey = (questionNumber + 1) 
            + (currentPage * this.quesPerPage);
        const hasFigure = (question.fig !== undefined);
        const explained = (explainedQuestions[questionKey] === true);
        const correctAnswer = question.options[question.ansKey];

        return (
            <React.Fragment key={questionKey}>
                <li className="questions">{question.name}</li>
                { hasFigure && <img className="figure"
                    src={Images[question.fig]} alt={question.fig}/> }
                <form className="optionGroup">
                <ol className="choices">
                {question.options.map((choice, index) => {
                    const choiceId = `${currentPage}${questionNumber}${index}`;
                    const isChecked = selOpts[questionKey] === choiceId;
                    const isCorrect = choice === correctAnswer;
                    const Feedback = () => {
                        const tick = '\u2714';
                        const cross = '\u2716';
                        const { feedback, feedbackSymbol } = isCorrect
                            ? { feedback: 'correct', feedbackSymbol: tick }
                            : { feedback: 'incorrect', feedbackSymbol: cross };
                        return (
                            <span className={`feedback ${feedback}`}>
                                {feedbackSymbol}</span>
                        );
                    }; 
                    return (
                        <li key={choiceId} className={(isCorrect && submitted) 
                            ? "submitted correct" : null}>
                        <input 
                            type="radio" 
                            name={question.name} 
                            id={choiceId}
                            value={choice}
                            checked={isChecked}
                            onChange={(event) => this.handleRadioChange(event,
                                questionKey, correctAnswer, question.points)}
                            disabled={submitted}
                        />
                        <label htmlFor={choiceId}><span>{choice}</span>
                            {submitted && isChecked && <Feedback />}</label>
                        </li>
                    );
                })}
                </ol>
                </form>
                {submitted && <button className="buttons expand" type="submit"
                    onClick={(event) => this.showExplanation(event,
                        questionKey)}>Explanation</button> }
                { explained && <p className="explanation"> 
                    <strong>Explanation: </strong>{question.hint}</p> } 
            </React.Fragment>
        );
    };


    handleRadioChange = (event, questionKey, correctAnswer, points) => {
        const { selOpts, totalAnswered, score } = this.state;
        const selectedValue = event.target.id;
        const selectedValueContent = event.target.value;
        const isCorrect = (selectedValueContent === correctAnswer);
        const hasAnswer = selOpts.questionKey !== undefined;
        const updateSelectedOptions = {
            ...selOpts,
            [questionKey]: selectedValue
        };
        const updatedAnsweredCount = hasAnswer 
            ? totalAnswered 
            : totalAnswered + 1;
        const updatedScore = isCorrect ? score + points : score;
        this.setState({
            selOpts: updateSelectedOptions,
            totalAnswered: updatedAnsweredCount,
            score: updatedScore,
        });
        localStorage.setItem(`myRadioValue-${questionKey}`, selectedValue);
    };

    displayNext = () => {
        const { currentPage, end } = this.state;
        if (currentPage <= this.totalPages) {
            this.setState({
                currentPage: currentPage + 1,
                start: end,
                end: end + this.quesPerPage,
            }, () => {
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                }, 100)
            });
        }
        else {
            alert("That's all folks! You've reached the end of the road.");
        }
    };

    displayPrevious = () => {
        const { currentPage, start } = this.state;
        if (currentPage > 1) {
            this.setState({
                currentPage: currentPage - 1,
                start: start - this.quesPerPage,
                end: start,
            }, () => {
                setTimeout(() => { 
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                }, 100);
            });
        }
        else {
            alert(`You're at the start of the road, my friend.
                There's no going back from here!`);
        }
    };

    handleSubmit = () => {
        const { submitted } = this.state;
        if (!submitted) {
            this.setState({
                submitted: true,
                currentPage: 1,
                start: 0,
                end: this.quesPerPage,
            }, () => {
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                }, 100);
            });
        }
        else
        {
            alert("Awkward! Reload and try again later.")
        }
    }

    showExplanation = (event, questionKey) => {
        const { explainedQuestions, currentPage } = this.state;
        const updateExplainedQuestions = {
            ...explainedQuestions,
            [questionKey]: true
        };
        this.setState({ explainedQuestions: updateExplainedQuestions });

        const button = document.getElementsByClassName('expand');
        const index = questionKey - (this.quesPerPage * currentPage) - 1 ;
        button[index].classList.add("expanded");
    }

    render() {
        const {
            start,
            end,
            currentPage,
            totalAnswered,
            submitted,
            score,
        } = this.state;
        const questions = this.quizData.slice(start, end).map(this.renderQues);
        const set = (currentPage <= this.sAQCount/this.quesPerPage) ? 'A':'B';
        const marksDistribution = (set === 'A')
            ? `1 x ${this.sAQCount} = ${this.sAQCount}` 
            : `2 x ${this.sBQCount} = ${2 * this.sBQCount}` 

        return (
            <>
                <SEO 
                    title={this.props.title}
                    name="Biomedical License"
                    description={this.props.title}
                    type="article" 
                />
                <h1>{this.props.heading}</h1>
                <h3>
                    <span>Group {set}</span>
                    <span>({marksDistribution})</span>
                </h3>
                <ol start={start + 1} id="questions">{questions}</ol>
                <hr style={{marginTop: "5rem"}}/>
                <div id="buttons">
                    <button id="next" className="buttons" type="submit"
                    onClick={this.displayNext}>Next</button>
                    <button id="previous" className="buttons" type="submit" 
                    onClick={this.displayPrevious}>Previous</button>
                </div>
                <hr/>
                <h4>Answered: {totalAnswered} / {this.totalQuestions}</h4>
                <button id="submit" className="buttons" type="submit"
                onClick={this.handleSubmit}>Submit</button>
                {
                    submitted && 
                    <div className="result">
                    <h4>
                    Your score: {`${(score/this.totalScore*100).toFixed(2)}%`}
                    <span className={score >= this.passMark ? 'pass' : 'fail'}>
                        {score >= this.passMark ? 'Pass' : 'Fail'}</span>
                    </h4>
                    </div>
                }
            </>
        );
    };
};


export default Quiz;
