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
  const [reviewPageOpened, setReviewPageOpened] = useState(false);
  const staticLive = import.meta.env.VITE_STATIC_SITE === 'true';
  const isWechatUrl = /^https:\/\/mp\.weixin\.qq\.com\/s(?:\/|\?)/i.test(url.trim());

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isWechatUrl) return;
    if (staticLive) {
      const issue = new URL('https://github.com/jyb635050-ai/bearingscope/issues/new');
      issue.searchParams.set('title', `[微信文章导入] ${title.trim() || url.trim()}`);
      issue.searchParams.set('body', [
        '## 公开文章 URL',
        url.trim(),
        '',
        '## 标题',
        title.trim() || '（未填写）',
        '',
        '## 品牌映射',
        brandId || '（未选择）',
        '',
        '> 仅请求审核公开元数据与原文链接，不授权复制全文。',
      ].join('\n'));
      window.open(issue.toString(), '_blank', 'noopener,noreferrer');
      setReviewPageOpened(true);
      return;
    }
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
        <p>{staticLive
          ? (language === 'zh' ? '粘贴公开文章链接，打开预填的 GitHub 审核单；确认提交后由维护者核验元数据。' : 'Paste a public article URL to open a prefilled GitHub review request; a maintainer verifies the metadata after you submit it.')
          : (language === 'zh' ? '粘贴公开文章链接，系统将保存元数据并进入人工审核队列。' : 'Paste a public article URL. Metadata will be queued for editorial review.')}</p>
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
        <button type="submit" className="button button--primary" disabled={!isWechatUrl || mutation.isPending}><Send aria-hidden="true" />{mutation.isPending ? (language === 'zh' ? '提交中…' : 'Submitting…') : staticLive ? (language === 'zh' ? '打开审核提交页' : 'Open review request') : (language === 'zh' ? '进入审核队列' : 'Queue for review')}</button>
        {reviewPageOpened && <p className="form-success" role="status"><CheckCircle2 aria-hidden="true" />{language === 'zh' ? 'GitHub 审核页已打开，请确认并提交。' : 'The GitHub review page is open; confirm and submit it there.'}</p>}
        {mutation.isSuccess && <p className="form-success" role="status"><CheckCircle2 aria-hidden="true" />{language === 'zh' ? '已进入审核队列。' : 'Queued for review.'}</p>}
        {mutation.isError && <p className="field-error" role="alert">{mutation.error.message}</p>}
      </form>
    </details>
  );
}
