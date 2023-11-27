import { useContext, useEffect, useReducer, useRef } from 'react';
import Button from '../Button/Button';
import cn from 'classnames';
import Input from '../Input/Input';

import { INITIAL_STATE, formReducer } from './JournalForm.state';
import { UserContext } from '../../context/user.context';
import styles from './JournalForm.module.css';

const JournalForm = ({ onSubmit, data, onDelete }) => {
  const [formState, dispatchForm] = useReducer(formReducer, INITIAL_STATE);
  const { isValid, isFormReadyToSubmit, values } = formState;
  const titleRef = useRef();
  const dateRef = useRef();
  const textRef = useRef();
  const { userId } = useContext(UserContext);

  const focusError = (isValid) => {
    switch (true) {
      case !isValid.title:
        titleRef.current.focus();
        break;
      case !isValid.date:
        dateRef.current.focus();
        break;
      case !isValid.text:
        textRef.current.focus();
        break;
    }
  };

  useEffect(() => {
    if (!data) {
      dispatchForm({ type: 'CLEAR' });
      dispatchForm({ type: 'SET_VALUE', payload: { userId } });
    }
    dispatchForm({ type: 'SET_VALUE', payload: { ...data } });
  }, [data]);

  useEffect(() => {
    let timerId;
    if (!isValid.date || !isValid.text || !isValid.title) {
      focusError(isValid);
      timerId = setTimeout(() => {
        dispatchForm({ type: 'RESET_VALIDITY' });
      }, 2000);
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [isValid]);

  useEffect(() => {
    if (isFormReadyToSubmit) {
      onSubmit(values);
      dispatchForm({ type: 'CLEAR' });
      dispatchForm({ type: 'SET_VALUE', payload: { userId } });
    }
  }, [isFormReadyToSubmit, values, onSubmit, userId]);

  useEffect(() => {
    dispatchForm({ type: 'SET_VALUE', payload: { userId } });
  }, [userId]);

  const onChange = (e) => {
    dispatchForm({ type: 'SET_VALUE', payload: { [e.target.name]: e.target.value } });
  };

  const addJournalItem = (e) => {
    e.preventDefault();
    dispatchForm({ type: 'SUBMIT' });
  };

  const deleteJournalItem = () => {
    onDelete(data.id);
    dispatchForm({ type: 'CLEAR' });
    dispatchForm({ type: 'SET_VALUE', payload: { userId } });
  };

  return (
    <form
      className={styles['journal-form']}
      onSubmit={addJournalItem}>
      <div className={cn(styles['form-row'])}>
        <Input
          type="text"
          ref={titleRef}
          value={values.title}
          isValid={isValid.title}
          onChange={onChange}
          name="title"
          appearance="title"
        />
        {data?.id && (
          <button
            className={styles['delete']}
            type="button"
            onClick={deleteJournalItem}>
            <img
              src="/delete.svg"
              alt="button delete"
            />
          </button>
        )}
      </div>
      <div className={styles['form-row']}>
        <label
          htmlFor="date"
          className={styles['form-label']}>
          <img
            src="/calendar.svg"
            alt="icon calendar"
          />
          <span>Date</span>
        </label>
        <Input
          type="date"
          value={values.date ? new Date(values.date).toISOString().slice(0, 10) : ''}
          ref={dateRef}
          isValid={isValid.date}
          onChange={onChange}
          name="date"
          id="date"
          className={cn(styles['input-date'], { [styles['invalid']]: !isValid.date })}
        />
      </div>
      <div className={styles['form-row']}>
        <label
          htmlFor="tag"
          className={styles['form-label']}>
          <img
            src="/folder.svg"
            alt="icon folder"
          />
          <span>Tags</span>
        </label>
        <Input
          className={styles['input']}
          type="text"
          value={values.tag}
          isValid={isValid.text}
          onChange={onChange}
          name="tag"
          id="tag"
        />
      </div>
      <textarea
        name="text"
        value={values.text}
        ref={textRef}
        onChange={onChange}
        className={cn(styles['textarea'], { [styles['invalid']]: !isValid.text })}
        cols="30"
        rows="10"></textarea>
      <Button>Save</Button>
    </form>
  );
};

export default JournalForm;
