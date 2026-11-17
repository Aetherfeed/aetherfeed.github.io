import React, { memo, useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Code, Lock, Copy, Check, ExternalLink, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { formatDate } from '../utils/formatDate';
import type { ProcessedPlugin } from '../utils/pluginProcessor';
import { TIER_META, type PunishTier } from '../utils/punishTiers';

interface PluginCardProps {
    plugin: ProcessedPlugin;
    maxApiLevel?: number;
    showIcon: boolean;
    isDescriptionExpanded: boolean;
    rowIndex: number;
    onToggleDescription: (rowIndex: number) => void;
    deferRendering?: boolean;
}

let lastCopyAnnouncement = '';

const TierIndicator: React.FC<{
    tier: PunishTier;
}> = ({ tier }) => {
    const meta = TIER_META[tier];
    const title = `puni.sh ${meta.label}`;

    const hoverTextColor =
        tier === 'core' ? 'hover:text-amber-600 dark:hover:text-amber-400' :
        tier === 'partner' ? 'hover:text-violet-600 dark:hover:text-violet-400' :
        'hover:text-teal-600 dark:hover:text-teal-400';

    const hoverBgColor =
        tier === 'core' ? 'hover:bg-amber-50 dark:hover:bg-amber-500/10' :
        tier === 'partner' ? 'hover:bg-violet-50 dark:hover:bg-violet-500/10' :
        'hover:bg-teal-50 dark:hover:bg-teal-500/10';

    return (
        <a
            href="https://puni.sh/"
            target="_blank"
            rel="noopener noreferrer"
            title={title}
            aria-label={`${title} repository directory`}
        >
            <span
                className={clsx(
                    'inline-flex items-center gap-1.5 h-8 px-2 rounded-lg',
                    'transition-colors text-slate-400',
                    hoverTextColor,
                    hoverBgColor
                )}
            >
                <img
                    src={`${import.meta.env.BASE_URL}punish-logo.webp`}
                    alt=""
                    aria-hidden="true"
                    width={18}
                    height={18}
                    loading="lazy"
                    decoding="async"
                    className="h-4.5 w-4.5 object-contain opacity-60 group-hover:opacity-100"
                />
                <span className="text-[10px] font-bold uppercase tracking-wide leading-none">
                    {meta.label}
                </span>
            </span>
        </a>
    );
};

const getApiBadgeColor = (level: number, maxLevel?: number) => {
    if (!maxLevel) return 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';

    if (level === maxLevel) {
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';
    }
    if (level === maxLevel - 1) {
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
    }
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
};

const PluginCard: React.FC<PluginCardProps> = ({
    plugin,
    maxApiLevel,
    showIcon,
    isDescriptionExpanded,
    rowIndex,
    onToggleDescription,
    deferRendering = false
}) => {
    const installUrl = plugin._repo.repo_url;
    const sourceUrl = plugin.RepoUrl || plugin._repo.repo_source_url;
    const isClosedSource = plugin.is_closed_source;
    const closedSourceUrl = sourceUrl || installUrl;
    const pluginName = plugin.Name || plugin.InternalName || 'plugin';
    const [failedIconUrl, setFailedIconUrl] = useState<string | null>(null);
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const timerRef = useRef<number | undefined>(undefined);
    const descId = useId();

    const descriptionText = plugin.Description || '';
    const hasLongDescription = descriptionText.length > 160;
    const version = plugin.AssemblyVersion?.trim();
    const versionLabel = version
        ? (version.toLowerCase().startsWith('v') ? version : `v${version}`)
        : undefined;

    const tier = plugin.punishTier;
    const showImg = Boolean(plugin.IconUrl && failedIconUrl !== plugin.IconUrl);

    useEffect(() => {
        return () => {
            if (timerRef.current !== undefined) {
                window.clearTimeout(timerRef.current);
            }
        };
    }, []);

    const showCopyFeedback = (ok: boolean) => {
        if (timerRef.current !== undefined) {
            window.clearTimeout(timerRef.current);
        }
        let message = ok ? 'Copied' : 'Copy failed';
        if (message === lastCopyAnnouncement) {
            message += '\u00A0';
        }
        lastCopyAnnouncement = message;
        setCopyState(ok ? 'copied' : 'failed');
        setStatusMessage(message);

        timerRef.current = window.setTimeout(() => {
            setCopyState('idle');
            setStatusMessage('');
            timerRef.current = undefined;
        }, 2000);
    };

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!installUrl) return;
        try {
            await navigator.clipboard.writeText(installUrl);
            showCopyFeedback(true);
        } catch (err) {
            console.error('Failed to copy:', err);
            showCopyFeedback(false);
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={clsx(
                'group relative flex flex-col bg-white/80 dark:bg-slate-900/60 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-aether-500/50 dark:hover:border-aether-500/50 transition-all duration-300 h-full shadow-xs hover:shadow-md',
                deferRendering && 'plugin-card-deferred'
            )}
        >
            <div className="p-5 flex flex-col grow">
                {/* Header: Title & Meta */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                        {showIcon && (
                            <span className="flex items-center justify-center w-10 h-10 rounded-[9px] shrink-0 overflow-hidden bg-[rgba(120,145,185,0.12)] border border-[rgba(150,170,205,0.06)]">
                                {showImg ? (
                                    <img
                                        src={plugin.IconUrl}
                                        alt=""
                                        aria-hidden="true"
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                        fetchPriority="low"
                                        referrerPolicy="no-referrer"
                                        onError={() => setFailedIconUrl(plugin.IconUrl ?? null)}
                                    />
                                ) : (
                                    <span className="text-sm font-bold text-[rgba(190,207,235,0.55)] select-none" aria-hidden="true">
                                        {pluginName[0].toUpperCase()}
                                    </span>
                                )}
                            </span>
                        )}
                        <div className="min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-aether-600 dark:group-hover:text-aether-400 transition-colors">
                                {plugin.Name}
                                {versionLabel && (
                                    <span
                                        className="ml-1.5 align-middle text-[10px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap opacity-80"
                                        title="Plugin version"
                                    >
                                        {versionLabel}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                <span>by</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{plugin.Author || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* API Badges */}
                        {plugin.plugin_api_levels_array.slice(0, 2).map((level) => (
                            <div key={level} className={`shrink-0 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getApiBadgeColor(level, maxApiLevel)}`}>
                                API {level}
                            </div>
                        ))}
                        {/* Last Updated */}
                        {plugin.plugin_last_updated_max_ts > 0 ? (
                            <time
                                dateTime={new Date(plugin.plugin_last_updated_max_ts).toISOString()}
                                title={new Date(plugin.plugin_last_updated_max_ts).toLocaleString()}
                                className="text-[10px] text-slate-400 font-medium whitespace-nowrap"
                            >
                                {formatDate(plugin.plugin_last_updated_max_ts)}
                            </time>
                        ) : (
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                N/A
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="mb-4 grow">
                    <p
                        id={descId}
                        className={clsx(
                            'text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-pretty',
                            !isDescriptionExpanded && 'line-clamp-2'
                        )}
                    >
                        {descriptionText}
                    </p>
                    {hasLongDescription && (
                        <button
                            type="button"
                            onClick={() => onToggleDescription(rowIndex)}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-aether-600 hover:text-aether-500 dark:text-aether-400 dark:hover:text-aether-300 transition-colors"
                            aria-expanded={isDescriptionExpanded}
                            aria-controls={descId}
                        >
                            <span>{isDescriptionExpanded ? 'Show less' : 'Read more'}</span>
                            <span className="visually-hidden"> about {pluginName}</span>
                            <ChevronDown
                                aria-hidden="true"
                                className={clsx('h-3.5 w-3.5 transition-transform', isDescriptionExpanded && 'rotate-180')}
                            />
                        </button>
                    )}
                </div>

                {/* Footer: Actions & Repo Info */}
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {/* Install Button Group */}
                        {installUrl && (
                            <div className="flex items-center rounded-lg shadow-xs bg-slate-900 dark:bg-white">
                                <a
                                    href={installUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-l-lg text-white dark:text-slate-900 text-xs font-semibold hover:bg-aether-600 dark:hover:bg-aether-200 transition-colors"
                                    title="Open Repository"
                                >
                                    <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
                                    <span>Repository</span>
                                    <span className="visually-hidden"> for {pluginName}</span>
                                </a>
                                <div className="h-4 w-px bg-white/20 dark:bg-slate-900/10" aria-hidden="true" />
                                <span className="relative inline-flex items-center">
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        data-copied={copyState === 'copied' ? '' : undefined}
                                        data-failed={copyState === 'failed' ? '' : undefined}
                                        className="flex items-center justify-center min-w-7 min-h-7 px-2 py-1.5 rounded-r-lg text-white dark:text-slate-900 hover:bg-aether-600 dark:hover:bg-aether-200 transition-colors"
                                        aria-label={`Copy repository URL for ${pluginName}`}
                                        title="Copy Repository URL"
                                    >
                                        {copyState === 'copied'
                                            ? <Check aria-hidden="true" className="w-3.5 h-3.5" />
                                            : <Copy aria-hidden="true" className="w-3.5 h-3.5" />}
                                    </button>
                                    <span
                                        role="status"
                                        className={clsx(
                                            'pointer-events-none absolute -top-8 right-0 z-20 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium shadow-sm transition-opacity duration-150',
                                            copyState === 'idle' ? 'opacity-0' : 'opacity-100',
                                            copyState === 'failed'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                        )}
                                    >
                                        {statusMessage}
                                    </span>
                                </span>
                            </div>
                        )}

                        {/* Source Link */}
                        {isClosedSource ? (
                            closedSourceUrl ? (
                                <a
                                    href={closedSourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-800/20 transition-colors"
                                    title="Closed Source"
                                >
                                    <Lock aria-hidden="true" className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">Closed Source</span>
                                    <span className="visually-hidden"> for {pluginName}</span>
                                </a>
                            ) : (
                                <span
                                    className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400"
                                    title="Closed Source"
                                >
                                    <Lock aria-hidden="true" className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">Closed Source</span>
                                </span>
                            )
                        ) : sourceUrl && (
                            <a
                                href={sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center p-1.5 rounded-lg transition-colors text-slate-400 hover:text-aether-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                aria-label={`View source for ${pluginName}`}
                                title="View Source"
                            >
                                <Code aria-hidden="true" className="w-4 h-4" />
                            </a>
                        )}

                        {plugin.is_ai_attributed && (
                            <span
                                className="inline-flex items-center gap-0.5 px-1 py-1.5 rounded-lg transition-colors text-violet-400/90 hover:text-violet-500 dark:text-violet-400/70 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                                title="Likely developed with AI, based on author credits, commits, contributors, or repository files"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
                                    <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
                                </svg>
                                <span className="text-[10px] font-bold uppercase tracking-wide leading-none">
                                    AI<span className="visually-hidden"> attributed</span>
                                </span>
                            </span>
                        )}
                    </div>

                    {(plugin.discordUrl || tier || plugin.isAetherTek) && (
                        <div className="flex items-center gap-2">
                            {plugin.discordUrl && (
                                <a
                                    href={plugin.discordUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors text-slate-400 hover:text-[#5865F2] hover:bg-slate-50 dark:hover:bg-slate-800"
                                    aria-label={`Join Discord server for ${pluginName}`}
                                    title="Join Discord Server"
                                >
                                    <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.2 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.05-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.85 2.12-1.89 2.12zM15.49 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.85 2.12-1.89 2.12z" />
                                    </svg>
                                </a>
                            )}
                            {plugin.isAetherTek && (
                                <a
                                    href="https://aethertek.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center"
                                    aria-label="Visit AetherTek"
                                    title="Visit AetherTek"
                                >
                                    <img
                                        src={`${import.meta.env.BASE_URL}aethertek-logo.png`}
                                        alt=""
                                        aria-hidden="true"
                                        width={24}
                                        height={24}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-6 w-6 object-contain opacity-70 hover:opacity-100 transition-opacity"
                                    />
                                </a>
                            )}
                            {tier && (
                                <TierIndicator tier={tier} />
                            )}
                        </div>
                    )}

                </div>
            </div>
        </motion.article>
    );
};

export default memo(PluginCard);
