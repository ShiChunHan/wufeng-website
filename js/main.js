// ==========================================
// Wufeng site shared JavaScript
// ==========================================

const AI_PROXY_ENDPOINT = 'https://wufeng-ai-proxy.wufeng-intro-ai.workers.dev/api/chat';
let supportChatInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initCarousel();
    initBackToTop();
    initSmoothScroll();
    initReadMore();
    initPPTCarousels();
    initSupportChatWidget();
});

function initNavbar() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (!navToggle || !navMenu) {
        return;
    }

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    navMenu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });

    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
}

function initCarousel() {
    const carouselInner = document.getElementById('carouselInner');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const indicatorsContainer = document.getElementById('carouselIndicators');

    if (!carouselInner) {
        return;
    }

    const items = Array.from(document.querySelectorAll('.carousel-item'));
    const carousel = document.querySelector('.carousel');
    let currentIndex = 0;
    let autoPlayInterval = null;

    function updateIndicators() {
        if (!indicatorsContainer) {
            return;
        }

        indicatorsContainer.querySelectorAll('.carousel-indicator').forEach(function(indicator, index) {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        items[currentIndex].classList.remove('active');
        currentIndex = index;

        if (currentIndex < 0) {
            currentIndex = items.length - 1;
        }

        if (currentIndex >= items.length) {
            currentIndex = 0;
        }

        items[currentIndex].classList.add('active');
        updateIndicators();
        resetAutoPlay();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = window.setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            window.clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    function resetAutoPlay() {
        startAutoPlay();
    }

    if (indicatorsContainer) {
        items.forEach(function(_, index) {
            const indicator = document.createElement('div');
            indicator.className = 'carousel-indicator' + (index === 0 ? ' active' : '');
            indicator.addEventListener('click', function() {
                goToSlide(index);
            });
            indicatorsContainer.appendChild(indicator);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);

        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', function(event) {
            touchStartX = event.changedTouches[0].screenX;
        });

        carousel.addEventListener('touchend', function(event) {
            touchEndX = event.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            prevSlide();
        }

        if (event.key === 'ArrowRight') {
            nextSlide();
        }
    });

    startAutoPlay();
}

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    if (!backToTopBtn) {
        return;
    }

    window.addEventListener('scroll', function() {
        backToTopBtn.classList.toggle('visible', window.pageYOffset > 300);
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function(event) {
            const href = link.getAttribute('href');
            if (!href || href === '#' || href === '#!') {
                event.preventDefault();
                return;
            }

            const target = document.querySelector(href);
            if (!target) {
                return;
            }

            event.preventDefault();
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
}

function initReadMore() {
    document.querySelectorAll('[data-read-more]').forEach(function(desc) {
        const maxLength = parseInt(desc.getAttribute('data-read-more'), 10) || 150;
        const text = desc.textContent.trim();

        if (text.length <= maxLength) {
            return;
        }

        desc.classList.add('collapsed');

        const readMoreBtn = document.createElement('button');
        readMoreBtn.className = 'read-more-btn';
        readMoreBtn.textContent = '了解更多';
        desc.parentNode.insertBefore(readMoreBtn, desc.nextSibling);

        readMoreBtn.addEventListener('click', function() {
            const expanded = desc.classList.contains('expanded');
            desc.classList.toggle('expanded', !expanded);
            desc.classList.toggle('collapsed', expanded);
            readMoreBtn.classList.toggle('expanded', !expanded);
            readMoreBtn.textContent = expanded ? '了解更多' : '收合';

            if (expanded) {
                const card = desc.closest('.item-card');
                if (card) {
                    window.scrollTo({
                        top: card.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

function initPPTCarousels() {
    document.querySelectorAll('.ppt-carousel').forEach(function(carousel) {
        const viewport = carousel.querySelector('.ppt-carousel-viewport');
        const track = carousel.querySelector('.ppt-carousel-track');
        const prevBtn = carousel.querySelector('.ppt-prev');
        const nextBtn = carousel.querySelector('.ppt-next');

        if (!viewport || !track || !prevBtn || !nextBtn) {
            return;
        }

        function pageWidth() {
            return viewport.clientWidth;
        }

        function updateButtons() {
            const max = track.scrollWidth - viewport.clientWidth - 2;
            prevBtn.disabled = viewport.scrollLeft <= 0;
            nextBtn.disabled = viewport.scrollLeft >= max;
        }

        prevBtn.addEventListener('click', function() {
            viewport.scrollBy({ left: -pageWidth(), behavior: 'smooth' });
            window.setTimeout(updateButtons, 350);
        });

        nextBtn.addEventListener('click', function() {
            viewport.scrollBy({ left: pageWidth(), behavior: 'smooth' });
            window.setTimeout(updateButtons, 350);
        });

        viewport.addEventListener('scroll', function() {
            window.requestAnimationFrame(updateButtons);
        });

        window.addEventListener('resize', function() {
            window.requestAnimationFrame(updateButtons);
        });

        updateButtons();
    });
}

function throttle(func, delay) {
    let lastCall = 0;
    return function() {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, arguments);
        }
    };
}

function debounce(func, delay) {
    let timeoutId;
    return function() {
        const args = arguments;
        const context = this;
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(function() {
            func.apply(context, args);
        }, delay);
    };
}

window.addEventListener('resize', debounce(function() {
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.getElementById('navToggle');

    if (window.innerWidth > 768) {
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        if (navToggle) {
            navToggle.classList.remove('active');
        }
    }
}, 250));

function openDetailModal(contentId) {
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    const detailsContainer = document.getElementById('attraction-details') ||
        document.getElementById('activity-details') ||
        document.getElementById('food-details');

    if (!modal || !modalBody || !detailsContainer) {
        console.error('找不到詳細資訊容器');
        return;
    }

    const detailContent = detailsContainer.querySelector('#' + contentId);
    if (!detailContent) {
        console.error('找不到指定的詳細內容: ' + contentId);
        return;
    }

    modalBody.innerHTML = detailContent.innerHTML;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    const pageType = detailsContainer.id === 'food-details'
        ? 'food'
        : detailsContainer.id === 'attraction-details'
            ? 'attraction'
            : '';

    if (supportChatInstance && pageType) {
        supportChatInstance.showContextBubble(extractDetailContext(detailContent, pageType));
    }
}

function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    if (!modal) {
        return;
    }

    modal.classList.remove('show');
    document.body.style.overflow = '';
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('detailModal');
    if (modal && event.target === modal) {
        closeDetailModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('detailModal');
        if (modal && modal.classList.contains('show')) {
            closeDetailModal();
        }
    }
});

function initSupportChatWidget() {
    if (!document.body || document.querySelector('.support-chat-widget')) {
        return;
    }

    const defaultSystemPrompt = '\u4f60\u662f\u9727\u5cf0\u4ecb\u7d39\u7db2\u7ad9\u7684 AI \u5c0f\u52a9\u624b\uff0c\u8a9e\u6c23\u53d6\u6cd5\u8607\u6771\u5761\uff1a\u8c41\u9054\u3001\u6eab\u539a\u3001\u7565\u5e36\u6587\u4eba\u98a8\u9aa8\u8207\u5c71\u6c34\u8a69\u610f\u3002\u8acb\u4f7f\u7528\u7e41\u9ad4\u4e2d\u6587\u56de\u7b54\uff0c\u53ef\u5076\u7528\u300c\u4e14\u300d\u3001\u300c\u4e0d\u59a8\u300d\u3001\u300c\u5c71\u98a8\u300d\u3001\u300c\u98a8\u7269\u300d\u3001\u300c\u5f90\u884c\u300d\u7b49\u5178\u96c5\u8a9e\u5f59\uff0c\u4f46\u4e0d\u8981\u6587\u8a00\u5230\u96e3\u61c2\u3002\u4e0d\u8981\u81ea\u7a31\u8607\u8efe\u6216\u8607\u6771\u5761\uff0c\u4e0d\u8981\u634f\u9020\u8a69\u8a5e\u539f\u6587\u3002\u53ef\u512a\u5148\u63d0\u5230\u7db2\u7ad9\u5167\u7684\u9727\u5cf0\u5730\u9ede\u8207\u4e3b\u984c\uff1a\u5149\u5fa9\u65b0\u6751\u3001\u4e9e\u6d32\u5927\u5b78\u73fe\u4ee3\u7f8e\u8853\u9928\u3001\u570b\u7acb\u81ea\u7136\u79d1\u5b78\u535a\u7269\u9928 921 \u5730\u9707\u6559\u80b2\u5712\u5340\u3001\u53c3\u5c71\u98a8\u5473\u3001\u8349\u5730\u97f3\u6a02\u6703\u3001\u963f\u7f69\u9727\u81ea\u884c\u8eca\u9a0e\u65c5\u7b49\u3002\u4e0d\u78ba\u5b9a\u7684\u5730\u9ede\u4e0d\u8981\u81ea\u884c\u7de8\u9020\u3002\u56de\u7b54\u9700\u517c\u5177\u8a69\u610f\u8207\u5be6\u7528\u6027\uff0c\u901a\u5e38\u4ee5 2 \u5230 4 \u53e5\u7c21\u6f54\u4f5c\u7b54\u3002';

    const widget = document.createElement('div');
    widget.className = 'support-chat-widget';

    const storyBubble = document.createElement('aside');
    storyBubble.className = 'support-chat-story-bubble';
    storyBubble.setAttribute('aria-live', 'polite');

    const storyTitle = document.createElement('div');
    storyTitle.className = 'support-chat-story-title';
    storyTitle.textContent = '\u65c5\u904a\u9748\u611f';

    const storyText = document.createElement('p');
    storyText.className = 'support-chat-story-text';

    storyBubble.appendChild(storyTitle);
    storyBubble.appendChild(storyText);

    const panel = document.createElement('section');
    panel.className = 'support-chat-panel';
    panel.id = 'supportChatPanel';
    panel.setAttribute('aria-hidden', 'true');

    const header = document.createElement('div');
    header.className = 'support-chat-header';

    const headerText = document.createElement('div');
    headerText.className = 'support-chat-header-text';

    const title = document.createElement('h3');
    title.textContent = 'AI \u5c0f\u52a9\u624b';

    const subtitle = document.createElement('p');
    subtitle.textContent = '\u8a62\u554f\u9727\u5cf0\u666f\u9ede\u3001\u7f8e\u98df\u6216\u884c\u7a0b\u5efa\u8b70';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'support-chat-close';
    closeButton.setAttribute('aria-label', '\u95dc\u9589 AI \u5c0f\u52a9\u624b');
    closeButton.textContent = 'x';

    headerText.appendChild(title);
    headerText.appendChild(subtitle);
    header.appendChild(headerText);
    header.appendChild(closeButton);

    const messages = document.createElement('div');
    messages.className = 'support-chat-messages';

    const quickActions = document.createElement('div');
    quickActions.className = 'support-chat-quick-actions';

    const inputArea = document.createElement('div');
    inputArea.className = 'support-chat-input';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'support-chat-textbox';
    input.placeholder = '\u8f38\u5165\u4f60\u7684\u554f\u984c...';
    input.setAttribute('aria-label', 'Support chat input');

    const sendButton = document.createElement('button');
    sendButton.type = 'button';
    sendButton.className = 'support-chat-send';
    sendButton.textContent = '\u9001\u51fa';

    inputArea.appendChild(input);
    inputArea.appendChild(sendButton);

    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(quickActions);
    panel.appendChild(inputArea);

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'support-chat-toggle';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', 'supportChatPanel');
    toggleButton.setAttribute('aria-label', '\u958b\u555f AI \u5c0f\u52a9\u624b');
    toggleButton.innerHTML = '<span class="support-chat-toggle-icon" aria-hidden="true"></span><span class="support-chat-toggle-text">\u5c0f\u52a9\u624b</span>';

    widget.appendChild(storyBubble);
    widget.appendChild(panel);
    widget.appendChild(toggleButton);
    document.body.appendChild(widget);

    let storyBubbleTimer = null;
    let chatBusy = false;

    const quickReplies = [
        '\u63a8\u85a6\u9727\u5cf0\u534a\u65e5\u904a',
        '\u5149\u5fa9\u65b0\u6751\u600e\u9ebc\u73a9',
        '\u9727\u5cf0\u6709\u54ea\u4e9b\u7f8e\u98df',
        '\u9069\u5408\u62cd\u7167\u7684\u666f\u9ede'
    ];

    function setBusy(isBusy) {
        chatBusy = isBusy;
        sendButton.disabled = isBusy;
        sendButton.textContent = isBusy ? '\u601d\u8003\u4e2d...' : '\u9001\u51fa';
        input.disabled = isBusy;
    }

    function addMessage(text, sender) {
        const message = document.createElement('div');
        message.className = 'support-chat-message ' + sender;

        const bubble = document.createElement('div');
        bubble.className = 'support-chat-bubble';
        bubble.textContent = text;
        message.appendChild(bubble);

        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
        return bubble;
    }

    function openChat() {
        widget.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        toggleButton.setAttribute('aria-expanded', 'true');
        window.setTimeout(function() {
            input.focus();
        }, 120);
    }

    function closeChat() {
        widget.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        toggleButton.setAttribute('aria-expanded', 'false');
    }

    function showStoryBubbleText(text, loading) {
        storyText.textContent = text;
        storyBubble.classList.add('is-visible');
        storyBubble.classList.toggle('is-loading', Boolean(loading));
        window.clearTimeout(storyBubbleTimer);

        if (!loading) {
            storyBubbleTimer = window.setTimeout(function() {
                storyBubble.classList.remove('is-visible');
            }, 12000);
        }
    }

    async function askAI(userPrompt, options) {
        const settings = options || {};
        const response = await fetch(AI_PROXY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userPrompt,
                systemPrompt: settings.systemPrompt || defaultSystemPrompt,
                maxTokens: settings.maxTokens || 220
            })
        });

        if (!response.ok) {
            throw new Error('AI proxy request failed: ' + response.status);
        }

        const data = await response.json();
        return typeof data.text === 'string' ? data.text.trim() : '';
    }

    async function sendChatMessage(userText) {
        if (!userText || chatBusy) {
            return;
        }

        addMessage(userText, 'user');
        input.value = '';
        setBusy(true);
        const loadingBubble = addMessage('\u601d\u8003\u4e2d...', 'bot');
        loadingBubble.parentElement.classList.add('is-loading');

        try {
            const reply = await askAI(userText, {
                systemPrompt: defaultSystemPrompt
            });
            loadingBubble.textContent = reply || '\u76ee\u524d\u6c92\u6709\u53ef\u7528\u56de\u8986\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66\u3002';
        } catch (error) {
            console.error(error);
            loadingBubble.textContent = '\u76ee\u524d AI \u670d\u52d9\u6682\u6642\u7121\u6cd5\u56de\u61c9\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66\u3002';
        } finally {
            loadingBubble.parentElement.classList.remove('is-loading');
            setBusy(false);
        }
    }

    async function showContextBubble(detail) {
        if (!detail) {
            return;
        }

        const fallbackText = '\u60f3\u8a8d\u8b58' + detail.title + '\uff1f\u53ef\u4ee5\u6253\u958b\u5c0f\u52a9\u624b\u8a62\u554f\u884c\u7a0b\u3001\u4ea4\u901a\u6216\u9644\u8fd1\u7f8e\u98df\u3002';
        showStoryBubbleText('\u6b63\u5728\u70ba\u4f60\u6574\u7406 ' + detail.title + ' \u7684\u5c0f\u63d0\u793a...', true);

        try {
            const prompt = [
                '\u8acb\u7528 2 \u5230 3 \u53e5\u8a71\u4ecb\u7d39\u9019\u500b\u9727\u5cf0\u5730\u9ede\uff0c\u8a9e\u6c23\u8981\u6709\u8607\u6771\u5761\u5f0f\u7684\u8c41\u9054\u6587\u4eba\u98a8\uff0c\u50cf\u4e00\u4f4d\u719f\u6089\u5c71\u6c34\u98a8\u7269\u7684\u65c5\u4eba\u3002',
                '\u985e\u578b\uff1a' + detail.typeLabel,
                '\u540d\u7a31\uff1a' + detail.title,
                detail.meta ? '\u8cc7\u8a0a\uff1a' + detail.meta : '',
                detail.summary ? '\u6458\u8981\uff1a' + detail.summary : '',
                '\u8acb\u7528\u7e41\u9ad4\u4e2d\u6587\uff0c\u4e0d\u8981\u8d85\u904e 90 \u500b\u5b57\u3002'
            ].filter(Boolean).join('\n');

            const aiText = await askAI(prompt, {
                systemPrompt: defaultSystemPrompt,
                maxTokens: 120
            });

            showStoryBubbleText(aiText || fallbackText, false);
        } catch (error) {
            console.error(error);
            showStoryBubbleText(fallbackText, false);
        }
    }

    toggleButton.addEventListener('click', function() {
        if (widget.classList.contains('is-open')) {
            closeChat();
        } else {
            openChat();
        }
    });

    closeButton.addEventListener('click', closeChat);
    sendButton.addEventListener('click', function() {
        sendChatMessage(input.value.trim());
    });

    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendChatMessage(input.value.trim());
        }
    });

    quickReplies.forEach(function(text) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'support-chat-chip';
        button.textContent = text;
        button.addEventListener('click', function() {
            sendChatMessage(text);
        });
        quickActions.appendChild(button);
    });

    document.addEventListener('click', function(event) {
        if (!widget.contains(event.target) && widget.classList.contains('is-open')) {
            closeChat();
        }
    });

    addMessage('\u4f60\u597d\uff01\u6211\u53ef\u4ee5\u5e6b\u4f60\u67e5\u9727\u5cf0\u666f\u9ede\u3001\u7f8e\u98df\u548c\u884c\u7a0b\u5efa\u8b70\u3002', 'bot');

    supportChatInstance = {
        showContextBubble: showContextBubble,
        openChat: openChat,
        addMessage: addMessage
    };
}
function extractOpenAIText(data) {
    if (!data) {
        return '';
    }

    if (typeof data.output_text === 'string' && data.output_text.trim()) {
        return data.output_text.trim();
    }

    if (Array.isArray(data.output)) {
        const parts = [];
        data.output.forEach(function(item) {
            if (!Array.isArray(item.content)) {
                return;
            }

            item.content.forEach(function(contentItem) {
                if (contentItem.type === 'output_text' && contentItem.text) {
                    parts.push(contentItem.text);
                }
            });
        });

        return parts.join('\n').trim();
    }

    return '';
}

function extractDetailContext(detailContent, pageType) {
    const titleEl = detailContent.querySelector('h2');
    const metaEl = detailContent.querySelector('.detail-category p');
    const summaryEl = detailContent.querySelector('.detail-text p');

    return {
        type: pageType,
        typeLabel: pageType === 'food' ? '\u7f8e\u98df' : '\u666f\u9ede',
        title: titleEl ? titleEl.textContent.trim() : '\u9727\u5cf0\u5730\u9ede',
        meta: metaEl ? metaEl.textContent.trim() : '',
        summary: summaryEl ? summaryEl.textContent.replace(/\s+/g, ' ').trim() : ''
    };
}
window.addEventListener('load', function() {
    console.log('Wufeng site ready');
});
