import  React from 'react';

import { SEO } from './seo';

import { loadQuiz } from '../dataLoader'

import Images from './Images';

import { MathComponent } from "mathjax-react";

class Quiz extends React.Component {

    constructor(props) {
        super(props);
        const quizData = loadQuiz(props.name);
        const totalQuestions = quizData.length;
        const questionsPerPage = 2;
        const selectedOptions = Array.from({totalQuestions}, (_, i) => 
            `${i+1}`).reduce((acc, key) => ({ ...acc, [key]: null }), {});
        this.quizData = quizData;
        this.totalPages = (totalQuestions / questionsPerPage) - 1;
        this.questionsPerPage = questionsPerPage;
        this.state = {
            currentPage: -1,
            start: 0,
            end: 0,
            selOpts: selectedOptions,
            totalQuestions: totalQuestions,
            totalAnswered: 0,
            submitted: false,
        }
    }

    componentDidMount() {
        this.displayNext();
    }

    handleRadioChange = (event, questionKey) => {
        const selectedValue = event.target.id;
        const { selOpts, totalAnswered } = this.state;
        const updateSelectedOptions = {
            ...selOpts,
            [questionKey]: selectedValue
        };
        const isAnswered = selOpts[questionKey] !== undefined;
        const updatedAnsweredCount = isAnswered ? totalAnswered : totalAnswered + 1;

        this.setState({
            selOpts: updateSelectedOptions,
            totalAnswered: updatedAnsweredCount
        });

        localStorage.setItem(`myRadioValue-${questionKey}`, selectedValue);
    };

    displayNext = () => {
        const { currentPage, end } = this.state;
        if (currentPage < this.totalPages) {
            this.setState({
                currentPage: currentPage + 1,
                start: end,
                end: end + this.questionsPerPage,
            })
        }
        else {
            alert("EON");
        }
    };

    displayPrevious = () => {
        const { currentPage, start } = this.state;
        if (currentPage > 0) {
            this.setState({
                currentPage: currentPage - 1,
                start: start - this.questionsPerPage,
                end: start,
            });
        }
        else {
            alert("EOP");
        }
    };

    handleSubmission = () => {
        // if (window.confirm("Do you really want to submit?")) {
        //     this.setState({submitted: true});
        // }
        this.setState({submitted: true});

    };

    renderQuestion = (question, questionNumber) => {
        const { currentPage, submitted, selOpts } = this.state;
        const questionKey = (questionNumber + 1) 
            + (currentPage * this.questionsPerPage);
        const hasFigure = (question.fig !== undefined);
        const hasEqn = (question.eqn !== undefined);

        return (
            <React.Fragment key={questionKey}>
                <li className="questions"> {question.name} </li>
                { hasFigure && <img src={Images[question.fig]} alt={question.fig}/> }
                { hasEqn && <MathComponent tex={question.eqn}/> }
                <form className="optionGroup">
                <ol className="choices">
                {question.options.map((choice, index) => {
                    const choiceId = `${currentPage}${questionNumber}${index}`;
                    const isChecked = selOpts[questionKey] === choiceId;
                    const isCorrect = choice === question.options[question.ansKey];
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
                            onChange={(event) => this.handleRadioChange(event, questionKey)}
                            disabled={submitted}
                        />
                        <label htmlFor={choiceId}><span>{choice}</span>
                            {submitted && isChecked && <Feedback />}</label>
                        </li>
                    );
                })}
                </ol>
                </form>
            </React.Fragment>
        );
    };

    render() {
        const {start, end, totalAnswered, totalQuestions } = this.state;
        const questions = this.quizData.slice(start, end).map(this.renderQuestion);

        return (
            <>
            <SEO 
            title="NEC Exam 2079" 
            name="Biomedical License"
            description="Nepal Engineering Council Exam for Biomedical Engineering 2079" 
            type="article" 
            />
            <h1>Nepal Enginnering Coucil License Exam {parseInt(this.props.name)}</h1>
            <ol start={start + 1}>{questions}</ol>
            <div id="buttons">
            <button id="previous" type="submit" onClick={this.displayPrevious}>Previous</button>
            <button id="next" type="submit" onClick={this.displayNext}>Next</button>
            <button id="submit" type="submit" onClick={this.handleSubmission}>Submit</button>
            </div>
            <h4>Answered: {totalAnswered} / {totalQuestions}</h4>
            <MathComponent tex={String.raw`\int_0^1 x^2\ dx`} />
            </>
        );
    };
};

export default Quiz;
