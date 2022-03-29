import NumberInput from '@/components/form/NumberInput';
import StringInput from '@/components/form/StringInput';
import TextareaInput from '@/components/form/TextareaInput';
import BooleanInput from '@/components/form/BooleanInput';
import ImageFileInput from '@/components/form/ImageFileInput';
import {
  SetSettingApiResponse,
  StringSetting,
  Setting,
} from '@/model/settings';
import { Form } from 'react-final-form';
import { useRecoilValue } from 'recoil';
import SubmitButton from '../form/SubmitButton';

interface SettingsFormProps {
  settings: Setting[] | undefined;
  setSetting: Function;
  disabled?: boolean;
}

const FormFields = (settings: Setting[]): JSX.Element => {
  const apiResponse = useRecoilValue(SetSettingApiResponse);

  return (
    <div className="space-y-4 mb-2">
      {settings.map((setting) => {
        let field;
        if (setting.type === 'String' || setting.type === 'IntegerList')
          field = StringInput(setting.key, apiResponse);
        else if (setting.type === 'Float' || setting.type === 'Integer')
          field = NumberInput(setting.key, apiResponse);
        else if (setting.type === 'Textarea')
          field = TextareaInput(setting.key, apiResponse);
        else if (setting.type === 'Boolean')
          field = BooleanInput(setting.key, apiResponse);
        else if (setting.type === 'Image')
          field = ImageFileInput(
            setting.key,
            setting.valueNormalized as string
          );

        if (!field) return null;

        return (
          <div key={setting.key}>
            <label className="block font-bold">{setting.label}</label>
            {setting.description && (
              <div className="mb-2 text-sm font-bold text-gray-400">
                {setting.description}
              </div>
            )}
            {field}
          </div>
        );
      })}
    </div>
  );
};

const DisabledFormFields = (settings: Setting[]): JSX.Element => (
  <>
    <div className="mb-8 p-4 text-center bg-red-200 text-white font-bold rounded-sm">
      Settings locked for this period
    </div>
    <div className="space-y-4 mb-2">
      {settings.map((setting: Setting) => (
        <div key={setting.key}>
          <label className="block font-bold">{setting.label}</label>
          {setting.description && (
            <div className="mb-2 text-sm font-bold text-gray-400">
              {setting.description}
            </div>
          )}
          <div className="p-2 bg-gray-200">{setting.value}</div>
        </div>
      ))}
    </div>
  </>
);

const SettingsForm = ({
  settings,
  setSetting,
  disabled = false,
}: SettingsFormProps): JSX.Element | null => {
  if (!Array.isArray(settings) || settings.length === 0) return null;

  // Is only called if validate is successful
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: Record<string, any>): Promise<void> => {
    for (const prop in values) {
      if (Object.prototype.hasOwnProperty.call(values, prop)) {
        const setting = settings?.find((s) => s.key === prop);
        if (setting && values[prop].toString() !== setting.value) {
          const item =
            setting.type === 'Image' ? values[prop][0] : values[prop];

          const updatedSetting = {
            ...setting,
            value: item,
          } as StringSetting;

          await setSetting(updatedSetting);
        }
      }
    }
  };

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
      render={({ handleSubmit }): JSX.Element => {
        if (disabled) {
          return DisabledFormFields(settings);
        } else {
          return (
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            <form onSubmit={handleSubmit} className="leading-loose">
              {FormFields(settings)}
              <SubmitButton />
            </form>
          );
        }
      }}
    />
  );
};

export default SettingsForm;
