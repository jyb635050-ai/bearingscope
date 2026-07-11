import { useState } from 'react';
import { CheckCircle2, Link2, MessageCircleMore, Send } from 'lucide-react';
import type { Brand } from '../../shared/types';
import type { Language } from '../../lib/i18n';
import { useWechatImport } from '../../lib/queries';

interface WechatImportFormProps {
  language: Language;
  brands?: Brand[];
}

export function WechatImportForm({ language, brands = [] }: WechatImportFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState('');
  const mutation = useWechatImport();
  const isWechatUrl = /^https:\/\/mp\.weixin\.qq\.com\/s(?:\/|\?)/i.test(url.trim());

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isWechatUrl) return;
    mutation.mutate({ url: url.trim(), title: title.trim() || undefined, brandId: brandId || undefined }, {
      onSuccess: () => {
        setUrl('');
        setTitle('');
        setBrandId('');
      },
    });
  };

  return (
    <details className="wechat-import">
      <summary><MessageCircleMore aria-hidden="true" />{language === 'zh' ? '提交微信公众号文章' : 'Submit a WeChat article'}</summary>
      <form onSubmit={submit}>
        <p>{language === 'zh' ? '粘贴公开文章链接，系统将保存元数据并进入人工审核队列。' : 'Paste a public article URL. Metadata will be queued for editorial review.'}</p>
        <label>
          <span>{language === 'zh' ? '公开文章链接' : 'Public article URL'}</span>
          <span className="input-with-icon"><Link2 aria-hidden="true" /><input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://mp.weixin.qq.com/s/..." required /></span>
        </label>
        {url && !isWechatUrl && <p className="field-error" role="alert">{language === 'zh' ? '请输入 mp.weixin.qq.com 的公开文章链接。' : 'Enter a public mp.weixin.qq.com article URL.'}</p>}
        <label>
          <span>{language === 'zh' ? '标题（可选）' : 'Title (optional)'}</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          <span>{language === 'zh' ? '关联品牌（可选）' : 'Related brand (optional)'}</span>
          <select value={brandId} onChange={(event) => setBrandId(event.target.value)}>
            <option value="">{language === 'zh' ? '暂不关联' : 'No brand'}</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.shortName}</option>)}
          </select>
        </label>
        <button type="submit" className="button button--primary" disabled={!isWechatUrl || mutation.isPending}><Send aria-hidden="true" />{mutation.isPending ? (language === 'zh' ? '提交中…' : 'Submitting…') : (language === 'zh' ? '进入审核队列' : 'Queue for review')}</button>
        {mutation.isSuccess && <p className="form-success" role="status"><CheckCircle2 aria-hidden="true" />{language === 'zh' ? '已进入审核队列。' : 'Queued for review.'}</p>}
        {mutation.isError && <p className="field-error" role="alert">{mutation.error.message}</p>}
      </form>
    </details>
  );
}
