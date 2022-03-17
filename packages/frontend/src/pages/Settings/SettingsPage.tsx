import BreadCrumb from '@/components/BreadCrumb';
import FieldErrorMessage from '@/components/form/FieldErrorMessage';
import {
  AllSettings,
  SetSettingApiResponse,
  Setting,
  useSetSetting,
  ImageSettingFullPath,
} from '@/model/settings';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import 'react-day-picker/lib/style.css';
import { Field, Form } from 'react-final-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import SubmitButton from './components/SubmitButton';

const SettingsForm = (): JSX.Element | null => {
  const [apiResponse] = useRecoilState(SetSettingApiResponse);
  const settings = useRecoilValue(AllSettings);
  const { setSetting } = useSetSetting();
  const logoPath = useRecoilValue(ImageSettingFullPath('LOGO'));

  // Is only called if validate is successful
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: Record<string, any>): Promise<void> => {
    for (const prop in values) {
      if (Object.prototype.hasOwnProperty.call(values, prop)) {
        const setting = settings?.find((s) => s.key === prop);
        if (setting && values[prop].toString() !== setting.value) {
          const item = prop === 'LOGO' ? values[prop][0] : values[prop];

          const updatedSetting = {
            ...setting,
            value: item,
          } as Setting;

          await setSetting(updatedSetting);
        }
      }
    }
  };

  const getStringInput = (setting: Setting): JSX.Element => {
    return (
      <Field name={setting.key} key={setting.key}>
        {({ input }): JSX.Element => {
          return (
            <div className="mb-2">
              <label className="block">{setting.key}</label>
              <input
                type="text"
                id={setting.key}
                {...input}
                autoComplete="off"
                className="block w-full"
              />
              {apiResponse && (
                <FieldErrorMessage name="name" apiResponse={apiResponse} />
              )}
            </div>
          );
        }}
      </Field>
    );
  };

  const getNumberInput = (setting: Setting): JSX.Element => {
    return (
      <Field name={setting.key} key={setting.key}>
        {({ input }): JSX.Element => (
          <div className="mb-2">
            <label className="block">{setting.key}</label>
            <input
              type="number"
              id={setting.key}
              {...input}
              autoComplete="off"
              className="block w-full"
            />
            {apiResponse && (
              <FieldErrorMessage name="name" apiResponse={apiResponse} />
            )}
          </div>
        )}
      </Field>
    );
  };

  const getTextareaInput = (setting: Setting): JSX.Element => {
    return (
      <Field name={setting.key} key={setting.key}>
        {({ input }): JSX.Element => (
          <div className="mb-2">
            <label className="block">{setting.key}</label>
            <textarea
              type="text"
              id={setting.key}
              {...input}
              autoComplete="off"
              className="block w-full resize-y "
            />
            {apiResponse && (
              <FieldErrorMessage name="name" apiResponse={apiResponse} />
            )}
          </div>
        )}
      </Field>
    );
  };

  const getFileInput = (setting: Setting): JSX.Element => {
    return (
      <Field<FileList> name={setting.key} key={setting.key}>
        {({ input: { value, onChange, ...input } }): JSX.Element => (
          <div className="mb-2">
            <label className="block">{setting.key}</label>
            <input
              {...input}
              id={setting.key}
              type="file"
              className="block w-full"
              onChange={({ target }) => onChange(target.files)}
            />
            <img src={logoPath} width="100" height="100"></img>
          </div>
        )}
      </Field>
    );
  };

  const getBooleanInput = (setting: Setting): JSX.Element => {
    return (
      <Field name={setting.key} key={setting.key} type="checkbox">
        {({ input }): JSX.Element => {
          return (
            <div className="mb-2">
              <label className="block">{setting.key}</label>
              <input id={setting.key} {...input} />
              {apiResponse && (
                <FieldErrorMessage name="name" apiResponse={apiResponse} />
              )}
            </div>
          );
        }}
      </Field>
    );
  };

  const getField = (setting: Setting): JSX.Element | null => {
    if (setting.type === 'String' || setting.type === 'List')
      return getStringInput(setting);
    if (setting.type === 'Number') return getNumberInput(setting);
    if (setting.type === 'Textarea') return getTextareaInput(setting);
    if (setting.type === 'Boolean') return getBooleanInput(setting);
    if (setting.type === 'Image') return getFileInput(setting);
    return null;
  };

  if (!Array.isArray(settings) || settings.length === 0) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialValues = {} as any;
  for (const setting of settings) {
    initialValues[setting.key] =
      setting.type === 'Boolean' ? setting.value === 'true' : setting.value;
  }

  return (
    <Form
      onSubmit={onSubmit}
      encType="multipart/form-data"
      initialValues={initialValues}
      mutators={{
        setDate: (args, state, utils): void => {
          utils.changeValue(state, 'endDate', () => args);
        },
      }}
      render={({ handleSubmit }): JSX.Element => (
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        <form onSubmit={handleSubmit} className="leading-loose">
          <div className="mb-3">
            {settings.map((setting: Setting) => getField(setting))}
          </div>
          <div className="mt-2">
            <SubmitButton />
          </div>
        </form>
      )}
    />
  );
};

const SettingsPage = (): JSX.Element => {
  return (
    <>
      <BreadCrumb name="Settings" icon={faCogs} />

      <div className="w-2/3 praise-box">
        <h2 className="mb-2">Settings</h2>
        <React.Suspense fallback="Loading…">
          <SettingsForm />
        </React.Suspense>
      </div>
    </>
  );
};

export default SettingsPage;
